/** Small shared pieces of scenery, all built in code. */
import { CanvasTexture, CircleGeometry, Color, Mesh, MeshBasicMaterial, Sprite, SpriteMaterial } from 'three';

/** A soft round shadow under a creature, so it reads as resting on a surface. */
export function blobShadow(radius: number, opacity = 0.22): Mesh {
  const tex = radialTexture('#000000', 1.0, 0.0);
  const mat = new MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false, color: new Color('#2b2420') });
  const m = new Mesh(new CircleGeometry(radius, 32), mat);
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** A glowing halo sprite for galaxy nodes. */
export function halo(color: string, size: number, opacity = 0.7): Sprite {
  const tex = radialTexture(color, 1.0, 0.0);
  const mat = new SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false, color: new Color(color) });
  const s = new Sprite(mat);
  s.scale.setScalar(size);
  return s;
}

const texCache = new Map<string, CanvasTexture>();

/** Radial gradient texture. Alpha goes from a0 at the center to a1 at the edge. */
export function radialTexture(color: string, a0: number, a1: number, size = 128): CanvasTexture {
  const key = `${color}:${a0}:${a1}:${size}`;
  const cached = texCache.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const c = new Color(color);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`;
  g.addColorStop(0, `rgba(${rgb},${a0})`);
  g.addColorStop(0.5, `rgba(${rgb},${(a0 + a1) / 2})`);
  g.addColorStop(1, `rgba(${rgb},${a1})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(canvas);
  texCache.set(key, tex);
  return tex;
}
