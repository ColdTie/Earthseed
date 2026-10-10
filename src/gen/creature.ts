/**
 * A living creature in Three.js: body mesh from the SDF, limbs from
 * primitives, and fully procedural motion. Built at edit time, animated
 * every frame.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  Group,
  Mesh,
  Object3D,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Genome } from '../sim/types';
import { Rng, seedFrom } from '../sim/rng';
import { crawlerPlan, type CrawlerPlan, type LegPlan } from './bodyplan';
import { crawlerBodyMesh } from './body';
import { setMood, toonMaterial } from './material';

const UP = new Vector3(0, 1, 0);
const tmpA = new Vector3();
const tmpB = new Vector3();
const tmpC = new Vector3();
const tmpD = new Vector3();

interface Leg {
  plan: LegPlan;
  hip: Vector3;
  rest: Vector3;
  foot: Vector3;
  knee: Vector3;
  femur: Mesh;
  tibia: Mesh;
  coxa: Mesh;
}

interface Antenna {
  base: Vector3;
  side: number;
  segments: Mesh[];
  tip: Mesh;
  /** Spring state: yaw and pitch angles with velocities. */
  yaw: number;
  pitch: number;
  vYaw: number;
  vPitch: number;
}

export interface CreatureMotion {
  /** Forward speed in body units per second. Zero means standing. */
  speed: number;
  /** Turn rate, radians per second. Antennae lag behind it. */
  turnRate: number;
  /** 0 to 1. How hard the gland is working. */
  producing: number;
}

/** Mood colors for the lighting in each view. */
export interface Mood {
  light: string;
  sky: string;
  ground: string;
  rim: string;
}

export const LAB_MOOD: Mood = { light: '#fff4e0', sky: '#e6edf5', ground: '#9a8c7d', rim: '#ffffff' };

export class Creature {
  readonly group = new Group();
  readonly plan: CrawlerPlan;
  readonly materials: ShaderMaterial[] = [];
  private legs: Leg[] = [];
  private antennae: Antenna[] = [];
  private gland!: Mesh;
  private glandMat!: ShaderMaterial;
  private antennaGlowMat!: ShaderMaterial;
  private body!: Mesh;
  private time = 0;
  private gaitPhase = 0;
  private variation: { scale: number; hue: number; gait: number };
  /** Draw calls this creature adds. */
  readonly drawCalls: number;
  /** Vertices in the soft body. */
  readonly bodyVertices: number;

  constructor(genome: Genome, individual = 0) {
    this.plan = crawlerPlan(genome);
    // Small per individual offsets so a crowd never looks cloned.
    const rng = new Rng(seedFrom(genome.seed, `individual:${individual}`));
    this.variation = {
      scale: individual === 0 ? 1 : rng.range(0.92, 1.08),
      hue: individual === 0 ? 0 : rng.range(-0.025, 0.025),
      gait: rng.range(0, 1),
    };
    this.gaitPhase = this.variation.gait;

    const p = this.plan;
    const s = p.size * this.variation.scale;
    this.group.scale.setScalar(this.variation.scale);

    // Colors. The shell darkens with heat tolerance.
    const shell = new Color(p.colors.shell).lerp(new Color(p.colors.shellHot), p.shellThick * 0.85);
    const body = new Color(p.colors.body);
    const belly = new Color(p.colors.belly);
    const head = new Color(p.colors.body).lerp(new Color(p.colors.limb), 0.25);
    for (const c of [shell, body, belly, head]) c.offsetHSL(p.hueShift + this.variation.hue, 0, 0);
    // Index by part id: 0 unused, 1 head, 2 thorax, 3 belly, 4 shell.
    const partColors = [body, head, body, belly, shell, shell];

    // Body mesh from the signed distance scene.
    const data = crawlerBodyMesh(p);
    this.bodyVertices = data.vertexCount;
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(data.positions, 3));
    geo.setAttribute('normal', new BufferAttribute(data.normals, 3));
    geo.setAttribute('part', new BufferAttribute(data.parts, 1));
    const bodyMat = toonMaterial({ color: body, finish: p.shellThick > 0.5 ? 'chitin' : 'chalky', partColors });
    this.materials.push(bodyMat);
    this.body = new Mesh(geo, bodyMat);
    this.group.add(this.body);

    const limbMat = toonMaterial({ color: new Color(p.colors.limb).offsetHSL(p.hueShift, 0, 0), finish: 'chitin' });
    this.materials.push(limbMat);
    let draws = 1;

    // Legs. Bone lengths never change, so each capsule is built at its real size.
    for (const lp of p.legs) {
      const femur = new Mesh(capsuleGeo(lp.radius, lp.femur), limbMat);
      const tibia = new Mesh(capsuleGeo(lp.radius * 0.8, lp.tibia), limbMat);
      const coxa = new Mesh(new SphereGeometry(lp.radius * 1.6, 8, 6), limbMat);
      this.group.add(femur, tibia, coxa);
      draws += 3;
      this.legs.push({
        plan: lp,
        hip: new Vector3(...lp.hip),
        rest: new Vector3(...lp.foot),
        foot: new Vector3(...lp.foot),
        knee: new Vector3(),
        femur,
        tibia,
        coxa,
      });
    }

    // Eyes.
    const eyeMat = toonMaterial({ color: p.colors.eye, finish: 'chitin' });
    eyeMat.uniforms.uSpecular!.value = 0.9;
    this.materials.push(eyeMat);
    const eyeGeo = new SphereGeometry(p.eyeRadius, 10, 8);
    for (const e of p.eyes) {
      const eye = new Mesh(eyeGeo, eyeMat);
      eye.position.set(...e);
      this.group.add(eye);
      draws += 1;
    }

    // Mandibles.
    const mandGeo = new ConeGeometry(p.mandible.radius, p.mandible.length, 6);
    for (const side of [1, -1]) {
      const m = new Mesh(mandGeo, limbMat);
      m.position.set(p.mandible.base[0] + p.mandible.length * 0.35, p.mandible.base[1], side * p.mandible.radius * 2.2);
      m.rotation.z = -Math.PI / 2;
      m.rotation.x = side * 0.5;
      this.group.add(m);
      draws += 1;
    }

    // Gland. Output makes it bigger and brighter.
    this.glandMat = toonMaterial({ color: p.colors.gland, finish: 'glow', emissive: p.colors.glandGlow, emissiveStrength: p.glandGlow });
    this.materials.push(this.glandMat);
    this.gland = new Mesh(new SphereGeometry(1, 14, 10), this.glandMat);
    this.gland.position.set(...p.gland);
    this.gland.scale.setScalar(p.glandRadius);
    this.group.add(this.gland);
    draws += 1;

    // Antennae. Signaling makes them longer with brighter pulses.
    const antMat = toonMaterial({ color: p.colors.antenna, finish: 'chitin' });
    this.antennaGlowMat = toonMaterial({ color: p.colors.antennaGlow, finish: 'glow', emissive: p.colors.antennaGlow, emissiveStrength: 0.6 });
    this.materials.push(antMat, this.antennaGlowMat);
    const segLen = p.antennaLength / p.antennaSegments;
    const antGeo = capsuleGeo(0.018 * s, segLen);
    const tipGeo = new SphereGeometry(0.035 * s * (0.8 + 0.6 * (p.pulseRate / 3)), 8, 6);
    p.antennaBase.forEach((base, i) => {
      const segments: Mesh[] = [];
      for (let k = 0; k < p.antennaSegments; k++) {
        const m = new Mesh(antGeo, antMat);
        this.group.add(m);
        segments.push(m);
        draws += 1;
      }
      const tip = new Mesh(tipGeo, this.antennaGlowMat);
      this.group.add(tip);
      draws += 1;
      this.antennae.push({
        base: new Vector3(...base),
        side: i === 0 ? 1 : -1,
        segments,
        tip,
        yaw: 0,
        pitch: 0,
        vYaw: 0,
        vPitch: 0,
      });
    });

    this.drawCalls = draws;
    this.setMood(LAB_MOOD);
    this.update(0, { speed: 0, turnRate: 0, producing: 0.5 });
  }

  setMood(mood: Mood): void {
    for (const m of this.materials) setMood(m, mood.light, mood.sky, mood.ground, mood.rim);
  }

  /** Advance the animation. dt in seconds. */
  update(dt: number, motion: CreatureMotion): void {
    const p = this.plan;
    this.time += dt;
    const t = this.time;

    // Breathing: the whole body swells a touch. Slower for long lived bodies.
    const breath = 1 + 0.012 * Math.sin(t * (1.2 - 0.3 * (p.size - 0.85)));
    this.body.scale.set(1, breath, 1);
    this.body.position.y = 0.01 * Math.sin(t * 1.1);

    // Gait. Walking advances the phase; standing still settles the feet.
    const walking = motion.speed > 0.01;
    const rate = p.gaitRate * (0.5 + motion.speed);
    if (walking) this.gaitPhase = (this.gaitPhase + dt * rate) % 1;
    const stride = 0.22 * p.size * Math.min(1, motion.speed);
    const lift = 0.12 * p.size;

    for (const leg of this.legs) {
      const lp = leg.plan;
      const phase = (this.gaitPhase + lp.phase) % 1;
      // Swing for the first 40% of the cycle, plant for the rest.
      const target = tmpA.copy(leg.rest);
      if (walking) {
        if (phase < 0.4) {
          const u = phase / 0.4;
          target.x += stride * (u * 2 - 1);
          target.y += lift * Math.sin(u * Math.PI);
        } else {
          const u = (phase - 0.4) / 0.6;
          target.x += stride * (1 - u * 2);
        }
      } else {
        // Idle: a tiny shift of weight so the beetle never looks frozen.
        target.y += 0.004 * p.size * Math.sin(t * 2.0 + lp.phase * 6.0);
      }
      leg.foot.lerp(target, walking ? 0.6 : Math.min(1, dt * 6));
      this.solveLeg(leg);
    }

    // Antennae: springs toward a rest pose, nudged by turning and a slow sway.
    for (const a of this.antennae) {
      const restYaw = a.side * 0.55 + 0.08 * Math.sin(t * 0.9 + a.side);
      const restPitch = 0.5 + 0.1 * Math.sin(t * 0.7 + a.side * 2.0);
      const targetYaw = restYaw - motion.turnRate * 0.35;
      const targetPitch = restPitch - Math.min(1, motion.speed) * 0.3;
      const k = 40;
      const damp = 6;
      a.vYaw += (-(a.yaw - targetYaw) * k - a.vYaw * damp) * dt;
      a.vPitch += (-(a.pitch - targetPitch) * k - a.vPitch * damp) * dt;
      a.yaw += a.vYaw * dt;
      a.pitch += a.vPitch * dt;
      this.placeAntenna(a);
    }

    // Antenna pulse: rhythm set by signaling.
    const pulse = 0.5 + 0.5 * Math.sin(t * p.pulseRate * Math.PI * 2);
    this.antennaGlowMat.uniforms.uEmissiveStrength!.value = 0.3 + 1.4 * pulse * (0.3 + 0.7 * (p.pulseRate / 3));

    // Gland pulse when producing.
    const gp = 0.5 + 0.5 * Math.sin(t * 2.2);
    const work = Math.max(0, Math.min(1, motion.producing));
    this.glandMat.uniforms.uEmissiveStrength!.value = p.glandGlow * (0.6 + 0.4 * gp * work) + 0.15 * work;
    const glandScale = p.glandRadius * (1 + 0.08 * gp * work);
    this.gland.scale.setScalar(glandScale);
  }

  /** Two bone IK: hip to knee to foot, knee bending up and outward. */
  private solveLeg(leg: Leg): void {
    const hip = leg.hip;
    const foot = leg.foot;
    const l1 = leg.plan.femur;
    const l2 = leg.plan.tibia;
    const dir = tmpB.subVectors(foot, hip);
    let d = dir.length();
    const maxReach = (l1 + l2) * 0.995;
    if (d > maxReach) {
      dir.multiplyScalar(maxReach / d);
      d = maxReach;
    }
    dir.normalize();
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    // Pole: up, bent outward away from the body.
    const outward = tmpC.set(0, 0, Math.sign(leg.plan.hip[2])).normalize();
    const pole = tmpD.copy(UP).multiplyScalar(0.8).addScaledVector(outward, 0.6);
    pole.addScaledVector(dir, -pole.dot(dir)).normalize();
    leg.knee.copy(hip).addScaledVector(dir, a).addScaledVector(pole, h);
    placeCapsule(leg.femur, hip, leg.knee);
    placeCapsule(leg.tibia, leg.knee, foot);
    leg.coxa.position.copy(hip);
  }

  private placeAntenna(a: Antenna): void {
    const p = this.plan;
    const segLen = p.antennaLength / p.antennaSegments;
    const pos = tmpA.copy(a.base);
    let yaw = a.yaw;
    let pitch = a.pitch;
    for (let i = 0; i < a.segments.length; i++) {
      // Each segment curls a little more outward and up.
      const dir = tmpB.set(Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw));
      const end = tmpC.copy(pos).addScaledVector(dir, segLen);
      placeCapsule(a.segments[i]!, pos, end);
      pos.copy(end);
      yaw += a.side * 0.25;
      pitch += 0.12;
    }
    a.tip.position.copy(pos);
  }
}

/** A capsule whose end to end length is `length`, along Y. */
function capsuleGeo(radius: number, length: number): CapsuleGeometry {
  return new CapsuleGeometry(radius, Math.max(0.001, length - 2 * radius), 2, 8);
}

/** Place a capsule so its middle sits between two points, pointing from one to the other. */
function placeCapsule(mesh: Object3D, from: Vector3, to: Vector3): void {
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  const dir = tmpD.subVectors(to, from).normalize();
  mesh.quaternion.setFromUnitVectors(UP, dir);
}
