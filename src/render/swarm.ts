/**
 * Swarm view: a miniature diorama of the build site. Lit by the planet.
 * The crew and the voxel wall arrive in the next task. For now the site,
 * the sea, the blueprint ghost, and the feed station are in place.
 */
import { BoxGeometry, Color, CylinderGeometry, EdgesGeometry, Fog, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, SphereGeometry, Vector3 } from 'three';
import type { SimState } from '../sim/types';
import { getContract, getPlanet } from '../sim/data';
import { toonMaterial, setMood } from '../gen/material';
import type { View } from './view';

export class SwarmView implements View {
  readonly id = 'swarm' as const;
  readonly scene = new Scene();
  readonly background: string;
  readonly bloom = 0.3;
  readonly bloomThreshold = 1.0;
  readonly pose = { position: new Vector3(24, 20, -30), target: new Vector3(-2, 0.5, 10) };
  readonly divePose = { position: new Vector3(3, 2, -3.5), target: new Vector3(0, 0.6, 0) };
  readonly farPose = { position: new Vector3(64, 54, -80), target: new Vector3(-2, 0.5, 10) };

  private sea: Mesh;
  private time = 0;
  private ghost: Mesh;
  private sun: Mesh;

  constructor(contractId = 'kessraSeaWall') {
    const contract = getContract(contractId);
    const planet = getPlanet(contract.planetId);
    const pal = planet.palette;
    this.background = pal.sky ?? '#ffd9a8';
    this.scene.background = new Color(this.background);
    this.scene.fog = new Fog(new Color(this.background), 40, 120);

    const mood = { light: '#ffe3bd', sky: pal.sky ?? '#ffd9a8', ground: '#b98a5c', rim: '#fff2d0' };

    const groundMat = toonMaterial({ color: pal.ground ?? '#d9a46b', finish: 'chalky' });
    setMood(groundMat, mood.light, mood.sky, mood.ground, mood.rim);
    groundMat.uniforms.uRimStrength!.value = 0.05;
    const ground = new Mesh(new PlaneGeometry(90, 50, 1, 1), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -14;
    this.scene.add(ground);

    const seaMat = toonMaterial({ color: pal.sea ?? '#1fb3a7', finish: 'chitin' });
    setMood(seaMat, mood.light, mood.sky, '#0f6b66', '#c9fff6');
    seaMat.uniforms.uSpecular!.value = 0.12;
    seaMat.uniforms.uRimStrength!.value = 0.08;
    this.sea = new Mesh(new PlaneGeometry(140, 80, 1, 1), seaMat);
    this.sea.rotation.x = -Math.PI / 2;
    this.sea.position.set(0, -0.04, 50);
    this.scene.add(this.sea);

    // Wet sand along the shore.
    const wetMat = toonMaterial({ color: '#c9a878', finish: 'chalky' });
    setMood(wetMat, mood.light, mood.sky, mood.ground, mood.rim);
    wetMat.uniforms.uRimStrength!.value = 0.05;
    const wet = new Mesh(new PlaneGeometry(90, 3.5, 1, 1), wetMat);
    wet.rotation.x = -Math.PI / 2;
    wet.position.set(0, 0.005, 9.3);
    this.scene.add(wet);

    // Blueprint ghost for the wall.
    const b = contract.blueprint;
    const box = new BoxGeometry(b.length, b.height, b.depth);
    const ghostMat = new MeshBasicMaterial({ color: new Color('#ffb347'), transparent: true, opacity: 0.18, depthWrite: false });
    this.ghost = new Mesh(box, ghostMat);
    this.ghost.position.set(0, b.height / 2, 6);
    this.scene.add(this.ghost);
    const edges = new LineSegments(new EdgesGeometry(box), new LineBasicMaterial({ color: new Color('#ffcf7a'), transparent: true, opacity: 0.9 }));
    edges.position.copy(this.ghost.position);
    this.scene.add(edges);

    // Feed station: a teal dome the crew eats from.
    const feedMat = toonMaterial({ color: '#14b8a6', finish: 'glow', emissive: '#7ef0ff', emissiveStrength: 0.25 });
    setMood(feedMat, mood.light, mood.sky, mood.ground, mood.rim);
    const feed = new Mesh(new SphereGeometry(1.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), feedMat);
    feed.position.set(-9, 0, 1);
    this.scene.add(feed);
    const base = new Mesh(new CylinderGeometry(1.4, 1.5, 0.3, 24), groundMat);
    base.position.set(-9, 0.15, 1);
    this.scene.add(base);

    // Hot orange sun on the horizon.
    const sunMat = new MeshBasicMaterial({ color: new Color(pal.sun ?? '#ff9a3c') });
    this.sun = new Mesh(new SphereGeometry(3.5, 24, 16), sunMat);
    this.sun.position.set(-24, 10, 70);
    this.scene.add(this.sun);
  }

  update(dt: number, _state: SimState | null): void {
    this.time += dt;
    // The tide breathes in and out.
    this.sea.position.z = 50 + Math.sin(this.time * 0.25) * 2.5;
    (this.ghost.material as MeshBasicMaterial).opacity = 0.14 + 0.06 * (0.5 + 0.5 * Math.sin(this.time * 1.5));
  }
}
