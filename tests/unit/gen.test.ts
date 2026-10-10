import { describe, expect, it } from 'vitest';
import { SdfScene, marchingCubes, sphere } from '../../src/gen/sdf';
import { crawlerPlan } from '../../src/gen/bodyplan';
import { crawlerBodyMesh } from '../../src/gen/body';
import { createGenome, setTrait } from '../../src/sim/genome';

function hash(arr: Float32Array): number {
  let h = 2166136261;
  for (let i = 0; i < arr.length; i++) {
    h ^= Math.round(arr[i]! * 1e5) & 0xffff;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

describe('marching cubes', () => {
  it('meshes a sphere with outward facing triangles', () => {
    const scene = new SdfScene().add(sphere(1, { x: 0, y: 0, z: 0 }, 0.5));
    const m = marchingCubes(scene, { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } }, 0.1);
    expect(m.vertexCount).toBeGreaterThan(300);
    expect(m.vertexCount % 3).toBe(0);
    let agree = 0;
    let total = 0;
    const tris = m.vertexCount / 3;
    for (let t = 0; t < tris; t++) {
      const p = m.positions;
      const i = t * 9;
      const ax = p[i + 3]! - p[i]!;
      const ay = p[i + 4]! - p[i + 1]!;
      const az = p[i + 5]! - p[i + 2]!;
      const bx = p[i + 6]! - p[i]!;
      const by = p[i + 7]! - p[i + 1]!;
      const bz = p[i + 8]! - p[i + 2]!;
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;
      // Outward for a sphere at the origin means pointing away from the center.
      // Weight by area so degenerate slivers do not count.
      const area = Math.hypot(nx, ny, nz);
      const dot = nx * p[i]! + ny * p[i + 1]! + nz * p[i + 2]!;
      total += area;
      if (dot > 0) agree += area;
    }
    expect(agree / total).toBeGreaterThan(0.99);
    // Every vertex sits near the surface.
    for (let i = 0; i < m.vertexCount; i++) {
      const r = Math.hypot(m.positions[i * 3]!, m.positions[i * 3 + 1]!, m.positions[i * 3 + 2]!);
      expect(Math.abs(r - 0.5)).toBeLessThan(0.02);
    }
  });
});

describe('crawler', () => {
  it('same genome gives the same mesh', () => {
    const g = createGenome('masonBeetle', 77);
    const a = crawlerBodyMesh(crawlerPlan(g));
    const b = crawlerBodyMesh(crawlerPlan(g));
    expect(a.vertexCount).toBe(b.vertexCount);
    expect(hash(a.positions)).toBe(hash(b.positions));
  });

  it('traits visibly change the plan', () => {
    const g = createGenome('masonBeetle', 1);
    const base = crawlerPlan(g);
    const hot = createGenome('masonBeetle', 1);
    setTrait(hot, 'heatTolerance', 90);
    const hotPlan = crawlerPlan(hot);
    expect(hotPlan.shellThick).toBeGreaterThan(base.shellThick);
    expect(hotPlan.ridges).toBeGreaterThan(base.ridges);
    expect(hotPlan.shell.r[1]).toBeGreaterThan(base.shell.r[1]);

    const out = createGenome('masonBeetle', 1);
    setTrait(out, 'output', 95);
    expect(crawlerPlan(out).glandRadius).toBeGreaterThan(base.glandRadius);
    expect(crawlerPlan(out).glandGlow).toBeGreaterThan(base.glandGlow);

    const sig = createGenome('masonBeetle', 1);
    setTrait(sig, 'signaling', 95);
    expect(crawlerPlan(sig).antennaLength).toBeGreaterThan(base.antennaLength);

    const old = createGenome('masonBeetle', 1);
    setTrait(old, 'lifespan', 95);
    expect(crawlerPlan(old).size).toBeGreaterThan(base.size);
    expect(crawlerPlan(old).gaitRate).toBeLessThan(base.gaitRate);
  });

  it('a different seed gives a different but same sized creature', () => {
    const a = crawlerPlan(createGenome('masonBeetle', 1));
    const b = crawlerPlan(createGenome('masonBeetle', 2));
    expect(a.size).toBe(b.size);
    expect(a.hueShift).not.toBe(b.hueShift);
  });

  it('body mesh stays within a sane vertex budget', () => {
    const m = crawlerBodyMesh(crawlerPlan(createGenome('masonBeetle', 3)));
    expect(m.vertexCount).toBeGreaterThan(2000);
    expect(m.vertexCount).toBeLessThan(120000);
  });
});
