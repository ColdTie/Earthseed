/**
 * Signed distance shapes and a marching cubes mesher.
 *
 * Bodies are built from blended spheres and capsules, meshed once per
 * species edit, never per frame. Each primitive carries a part id so the
 * mesher can color vertices by which part they belong to.
 */
import { edgeTable, triTable } from 'three/examples/jsm/objects/MarchingCubes.js';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SdfPrimitive {
  /** Which part this is, used for vertex colors. */
  part: number;
  /** Signed distance at a point. Negative inside. */
  dist(x: number, y: number, z: number): number;
  /** Smoothing radius when blending with what came before. */
  blend: number;
}

export interface SdfSample {
  d: number;
  part: number;
}

export function ellipsoid(part: number, c: Vec3, r: Vec3, blend = 0.1): SdfPrimitive {
  return {
    part,
    blend,
    dist(x, y, z) {
      const px = (x - c.x) / r.x;
      const py = (y - c.y) / r.y;
      const pz = (z - c.z) / r.z;
      const k0 = Math.sqrt(px * px + py * py + pz * pz);
      const k1 = Math.sqrt((px / r.x) ** 2 + (py / r.y) ** 2 + (pz / r.z) ** 2);
      return k1 > 0 ? (k0 * (k0 - 1)) / k1 : -Math.min(r.x, r.y, r.z);
    },
  };
}

export function sphere(part: number, c: Vec3, r: number, blend = 0.1): SdfPrimitive {
  return {
    part,
    blend,
    dist(x, y, z) {
      const dx = x - c.x;
      const dy = y - c.y;
      const dz = z - c.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
    },
  };
}

export function capsule(part: number, a: Vec3, b: Vec3, r: number, blend = 0.1): SdfPrimitive {
  const bax = b.x - a.x;
  const bay = b.y - a.y;
  const baz = b.z - a.z;
  const len2 = bax * bax + bay * bay + baz * baz || 1;
  return {
    part,
    blend,
    dist(x, y, z) {
      const pax = x - a.x;
      const pay = y - a.y;
      const paz = z - a.z;
      let h = (pax * bax + pay * bay + paz * baz) / len2;
      h = h < 0 ? 0 : h > 1 ? 1 : h;
      const dx = pax - bax * h;
      const dy = pay - bay * h;
      const dz = paz - baz * h;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
    },
  };
}

/** Keep only the part of a shape above a plane y = yMin, with a soft edge. */
export function clipBelow(p: SdfPrimitive, yMin: number): SdfPrimitive {
  return {
    part: p.part,
    blend: p.blend,
    dist(x, y, z) {
      const d = p.dist(x, y, z);
      const plane = yMin - y;
      // Smooth intersection.
      const k = 0.05;
      const h = Math.max(k - Math.abs(d - plane), 0) / k;
      return Math.max(d, plane) + h * h * k * 0.25;
    },
  };
}

/** Add a displacement to a shape's surface. */
export function displace(p: SdfPrimitive, fn: (x: number, y: number, z: number) => number): SdfPrimitive {
  return {
    part: p.part,
    blend: p.blend,
    dist(x, y, z) {
      return p.dist(x, y, z) + fn(x, y, z);
    },
  };
}

/** Polynomial smooth minimum. */
export function smin(a: number, b: number, k: number): number {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

export class SdfScene {
  readonly prims: SdfPrimitive[] = [];

  add(p: SdfPrimitive): this {
    this.prims.push(p);
    return this;
  }

  sample(x: number, y: number, z: number, out: SdfSample): SdfSample {
    let d = Infinity;
    let part = 0;
    let best = Infinity;
    for (const p of this.prims) {
      const pd = p.dist(x, y, z);
      d = smin(d, pd, p.blend);
      if (pd < best) {
        best = pd;
        part = p.part;
      }
    }
    out.d = d;
    out.part = part;
    return out;
  }

  dist(x: number, y: number, z: number): number {
    let d = Infinity;
    for (const p of this.prims) d = smin(d, p.dist(x, y, z), p.blend);
    return d;
  }
}

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  parts: Float32Array;
  vertexCount: number;
}

export interface MeshBounds {
  min: Vec3;
  max: Vec3;
}

/**
 * Marching cubes over a signed distance scene. Uses the lookup tables that
 * ship with Three.js. Corner and edge order follow Paul Bourke's layout,
 * the same one Three's MarchingCubes uses.
 */
export function marchingCubes(scene: SdfScene, bounds: MeshBounds, cell: number): MeshData {
  const nx = Math.max(2, Math.ceil((bounds.max.x - bounds.min.x) / cell) + 1);
  const ny = Math.max(2, Math.ceil((bounds.max.y - bounds.min.y) / cell) + 1);
  const nz = Math.max(2, Math.ceil((bounds.max.z - bounds.min.z) / cell) + 1);
  const field = new Float32Array(nx * ny * nz);
  // Which part is nearest at each grid corner, taken from the same samples.
  const partField = new Uint8Array(nx * ny * nz);
  const sampleOut: SdfSample = { d: 0, part: 0 };
  const idx = (i: number, j: number, k: number) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) {
    const z = bounds.min.z + k * cell;
    for (let j = 0; j < ny; j++) {
      const y = bounds.min.y + j * cell;
      for (let i = 0; i < nx; i++) {
        const x = bounds.min.x + i * cell;
        const id = idx(i, j, k);
        scene.sample(x, y, z, sampleOut);
        field[id] = sampleOut.d;
        partField[id] = sampleOut.part;
      }
    }
  }

  // Surface normals come from the field's gradient at each grid corner,
  // by central differences, then blend along each edge. This reuses the
  // samples above instead of evaluating the shapes again per vertex.
  const total = nx * ny * nz;
  const gradX = new Float32Array(total);
  const gradY = new Float32Array(total);
  const gradZ = new Float32Array(total);
  for (let k = 0; k < nz; k++) {
    const k0 = k > 0 ? k - 1 : k;
    const k1 = k < nz - 1 ? k + 1 : k;
    for (let j = 0; j < ny; j++) {
      const j0 = j > 0 ? j - 1 : j;
      const j1 = j < ny - 1 ? j + 1 : j;
      for (let i = 0; i < nx; i++) {
        const i0 = i > 0 ? i - 1 : i;
        const i1 = i < nx - 1 ? i + 1 : i;
        const id = idx(i, j, k);
        gradX[id] = (field[idx(i1, j, k)]! - field[idx(i0, j, k)]!) / (i1 - i0);
        gradY[id] = (field[idx(i, j1, k)]! - field[idx(i, j0, k)]!) / (j1 - j0);
        gradZ[id] = (field[idx(i, j, k1)]! - field[idx(i, j, k0)]!) / (k1 - k0);
      }
    }
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const parts: number[] = [];
  const vert = new Float32Array(12 * 3);
  const norm = new Float32Array(12 * 3);
  const edgePart = new Uint8Array(12);

  const corner = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
  ] as const;
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ] as const;
  const cv = new Float32Array(8);
  const ci = new Int32Array(8);

  for (let k = 0; k < nz - 1; k++) {
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        let cubeIndex = 0;
        for (let c = 0; c < 8; c++) {
          const [di, dj, dk] = corner[c]!;
          const id = idx(i + di, j + dj, k + dk);
          const v = field[id]!;
          cv[c] = v;
          ci[c] = id;
          // Outside when the distance is positive.
          if (v > 0) cubeIndex |= 1 << c;
        }
        const bits = edgeTable[cubeIndex]!;
        if (bits === 0) continue;
        for (let e = 0; e < 12; e++) {
          if (!(bits & (1 << e))) continue;
          const [a, b] = edges[e]!;
          const va = cv[a]!;
          const vb = cv[b]!;
          const t = Math.abs(vb - va) < 1e-9 ? 0.5 : (0 - va) / (vb - va);
          const ca = corner[a]!;
          const cb = corner[b]!;
          vert[e * 3] = bounds.min.x + (i + ca[0] + (cb[0] - ca[0]) * t) * cell;
          vert[e * 3 + 1] = bounds.min.y + (j + ca[1] + (cb[1] - ca[1]) * t) * cell;
          vert[e * 3 + 2] = bounds.min.z + (k + ca[2] + (cb[2] - ca[2]) * t) * cell;
          const ia = ci[a]!;
          const ib = ci[b]!;
          norm[e * 3] = gradX[ia]! + (gradX[ib]! - gradX[ia]!) * t;
          norm[e * 3 + 1] = gradY[ia]! + (gradY[ib]! - gradY[ia]!) * t;
          norm[e * 3 + 2] = gradZ[ia]! + (gradZ[ib]! - gradZ[ia]!) * t;
          // The part on the inside end of the edge owns the vertex.
          edgePart[e] = partField[va <= 0 ? ia : ib]!;
        }
        const base = cubeIndex << 4;
        for (let t = 0; triTable[base + t]! !== -1; t += 3) {
          // Table order faces outward with the outside bit convention above.
          const order = [triTable[base + t]!, triTable[base + t + 1]!, triTable[base + t + 2]!];
          for (const e of order) {
            const x = vert[e * 3]!;
            const y = vert[e * 3 + 1]!;
            const z = vert[e * 3 + 2]!;
            positions.push(x, y, z);
            const gx = norm[e * 3]!;
            const gy = norm[e * 3 + 1]!;
            const gz = norm[e * 3 + 2]!;
            const len = Math.hypot(gx, gy, gz) || 1;
            normals.push(gx / len, gy / len, gz / len);
            parts.push(edgePart[e]!);
          }
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    parts: new Float32Array(parts),
    vertexCount: positions.length / 3,
  };
}
