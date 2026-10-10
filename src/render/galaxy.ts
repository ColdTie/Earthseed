/**
 * Galaxy view: a deep navy star map. Glowing planet nodes, a seed ship
 * trail, restrained bloom. This is where problems come from.
 */
import { BufferAttribute, BufferGeometry, Color, Group, Line, LineDashedMaterial, Mesh, MeshBasicMaterial, Points, PointsMaterial, Scene, SphereGeometry, Vector3 } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { SimState } from '../sim/types';
import { PLANETS } from '../sim/data';
import { Rng } from '../sim/rng';
import { halo } from './scenery';
import type { View } from './view';

const SCALE = 1.25;

export class GalaxyView implements View {
  readonly id = 'galaxy' as const;
  readonly scene = new Scene();
  readonly background = '#0b1424';
  readonly bloom = 0.7;
  readonly bloomThreshold = 0.55;
  readonly pose = { position: new Vector3(2.2, 0.1, 15), target: new Vector3(2.2, 0.0, 0) };
  readonly divePose: { position: Vector3; target: Vector3 };
  readonly farPose = { position: new Vector3(2.2, 0.1, 46), target: new Vector3(2.2, 0.0, 0) };

  private ship: Mesh;
  private route: { from: Vector3; to: Vector3 };
  private time = 0;
  private nodes = new Group();

  constructor(focusPlanetId = 'kessra') {
    this.scene.background = new Color(this.background);

    // Stars, seeded so the sky is the same every time.
    const rng = new Rng(7);
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = rng.range(-30, 30);
      pos[i * 3 + 1] = rng.range(-18, 18);
      pos[i * 3 + 2] = rng.range(-30, -6);
    }
    const starGeo = new BufferGeometry();
    starGeo.setAttribute('position', new BufferAttribute(pos, 3));
    this.scene.add(new Points(starGeo, new PointsMaterial({ color: new Color('#aebfd6'), size: 0.06, sizeAttenuation: true })));

    const focus = PLANETS[focusPlanetId]!;
    const focusPos = new Vector3(...focus.position).multiplyScalar(SCALE);
    this.divePose = { position: focusPos.clone().add(new Vector3(0, 0, 1.2)), target: focusPos.clone() };

    for (const planet of Object.values(PLANETS)) {
      const p = new Vector3(...planet.position).multiplyScalar(SCALE);
      const color = planet.locked ? '#55627a' : planet.palette.node ?? '#ffffff';
      const node = new Mesh(new SphereGeometry(planet.locked ? 0.16 : 0.22, 20, 14), new MeshBasicMaterial({ color: new Color(color) }));
      node.position.copy(p);
      this.nodes.add(node);
      const h = halo(color, planet.locked ? 0.7 : 1.1, planet.locked ? 0.2 : 0.4);
      h.position.copy(p);
      this.nodes.add(h);

      const el = document.createElement('div');
      el.className = 'galaxy-label' + (planet.locked ? ' locked' : '');
      el.innerHTML = `<strong>${planet.name}</strong><span>${planet.locked ? 'Locked' : planet.type}</span>`;
      const label = new CSS2DObject(el);
      label.position.set(p.x, p.y - 0.5, p.z);
      this.nodes.add(label);
    }
    this.scene.add(this.nodes);

    // The one seed ship route: Hollow Reach feeds Kessra.
    const from = new Vector3(...PLANETS.hollowReach!.position).multiplyScalar(SCALE);
    const to = new Vector3(...PLANETS.kessra!.position).multiplyScalar(SCALE);
    this.route = { from, to };
    const lineGeo = new BufferGeometry().setFromPoints([from, to]);
    const line = new Line(lineGeo, new LineDashedMaterial({ color: new Color('#5ad6c4'), dashSize: 0.18, gapSize: 0.12, transparent: true, opacity: 0.7 }));
    line.computeLineDistances();
    this.scene.add(line);

    this.ship = new Mesh(new SphereGeometry(0.07, 10, 8), new MeshBasicMaterial({ color: new Color('#e7fff9') }));
    this.scene.add(this.ship);
    const shipHalo = halo('#7ef0ff', 0.5, 0.6);
    this.ship.add(shipHalo);
  }

  update(dt: number, _state: SimState | null): void {
    this.time += dt;
    // The ship goes out and back on a fixed cycle until logistics are simulated.
    const u = (this.time / 24) % 1;
    const t = u < 0.5 ? u * 2 : 2 - u * 2;
    this.ship.position.lerpVectors(this.route.from, this.route.to, t);
  }
}
