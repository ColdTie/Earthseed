/**
 * The soft body of a crawler as a signed distance scene, then meshed.
 * Pure: no Three.js, so determinism can be tested in Node.
 */
import { PART, crawlerBounds, type CrawlerPlan } from './bodyplan';
import { SdfScene, clipBelow, displace, ellipsoid, marchingCubes, type MeshData } from './sdf';

function v(a: [number, number, number]) {
  return { x: a[0], y: a[1], z: a[2] };
}

export function crawlerBodyScene(plan: CrawlerPlan): SdfScene {
  const scene = new SdfScene();
  const blend = 0.14 * plan.size;
  scene.add(ellipsoid(PART.BELLY, v(plan.belly.c), v(plan.belly.r), blend));
  scene.add(ellipsoid(PART.THORAX, v(plan.thorax.c), v(plan.thorax.r), blend));
  scene.add(ellipsoid(PART.HEAD, v(plan.head.c), v(plan.head.r), blend * 0.6));

  // The shell sits over the belly. Heat tolerance thickens it and raises
  // ridges running front to back. A small blend keeps a visible seam.
  const shell = ellipsoid(PART.SHELL, v(plan.shell.c), v(plan.shell.r), 0.03 * plan.size);
  const ridges = plan.ridges;
  const amp = plan.shell.ridgeAmp;
  const halfWidth = plan.shell.r[2];
  const ridged = displace(clipBelow(shell, plan.shell.clipY), (x, y, z) => {
    if (amp <= 0) return 0;
    const u = (z / halfWidth) * Math.PI * ridges * 0.5;
    const fade = Math.min(1, Math.max(0, (y - plan.shell.clipY) / (0.2 * plan.size)));
    return amp * (0.5 + 0.5 * Math.cos(u * 2)) * fade;
  });
  scene.add(ridged);
  return scene;
}

export function crawlerBodyMesh(plan: CrawlerPlan, cell = 0.034): MeshData {
  const b = crawlerBounds(plan);
  const scene = crawlerBodyScene(plan);
  return marchingCubes(scene, { min: v(b.min), max: v(b.max) }, cell * plan.size);
}
