/**
 * Organism view: a specimen dish in a calm lab. The creature turns slowly
 * on a turntable under soft studio light. This is where problems get solved.
 */
import { Color, CylinderGeometry, Group, Mesh, Scene, TorusGeometry, Vector3 } from 'three';
import type { SimState, Genome } from '../sim/types';
import { Creature, LAB_MOOD } from '../gen/creature';
import { FULL_CELL } from '../gen/body';
import { toonMaterial, setMood } from '../gen/material';
import { blobShadow } from './scenery';
import { Rng } from '../sim/rng';
import type { View } from './view';

const TURN_RATE = 0.22;
/** Coarser mesh while a slider moves: about a third of the full build time. */
const PREVIEW_CELL = 0.05;
const PREVIEW_INTERVAL_MS = 90;
/** Rebuild at full detail once the genome has been still this long. */
const SETTLE_MS = 250;

export class OrganismView implements View {
  readonly id = 'organism' as const;
  readonly scene = new Scene();
  readonly background = '#e7e1d8';
  readonly bloom = 0.3;
  readonly bloomThreshold = 1.0;
  readonly pose = { position: new Vector3(3.9, 2.3, 4.6), target: new Vector3(0.55, 0.05, 0) };
  readonly divePose = { position: new Vector3(1.0, 0.6, 1.2), target: new Vector3(0, 0.1, 0) };
  readonly farPose = { position: new Vector3(11, 7, 12), target: new Vector3(0, 0.15, 0) };

  private turntable = new Group();
  private creature: Creature | null = null;
  /** The genome on screen, and whether it is at full detail. */
  private genomeKey = '';
  private shownFull = false;
  /** The genome the sim wants shown, and when it last changed. */
  private wantKey = '';
  private wantGenome: Genome | null = null;
  private changedAt = 0;
  private lastBuild = -Infinity;
  private shadow: Mesh;
  private idle = { timer: 2, mode: 'stand' as 'stand' | 'step' | 'look', left: 0, yaw: 0, yawTarget: 0 };
  private producing = 0.5;
  /** Idle choices are seeded so screenshots repeat. */
  private rng = new Rng(11);
  /** Which genome to show. The draft is what the player is editing. */
  showDraft = true;

  constructor() {
    this.scene.background = new Color(this.background);

    const dishMat = toonMaterial({ color: '#f7f3ec', finish: 'chalky' });
    setMood(dishMat, LAB_MOOD.light, LAB_MOOD.sky, LAB_MOOD.ground, '#ffffff');
    dishMat.uniforms.uRimStrength!.value = 0.12;
    const dish = new Mesh(new CylinderGeometry(1.75, 1.85, 0.16, 48), dishMat);
    dish.position.y = -0.52;
    this.scene.add(dish);

    const rimMat = toonMaterial({ color: '#14b8a6', finish: 'chitin' });
    setMood(rimMat, LAB_MOOD.light, LAB_MOOD.sky, LAB_MOOD.ground, '#ffffff');
    const ring = new Mesh(new TorusGeometry(1.78, 0.03, 8, 64), rimMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.44;
    this.scene.add(ring);

    this.shadow = blobShadow(1.1, 0.2);
    this.shadow.position.y = -0.435;
    this.turntable.add(this.shadow);
    this.scene.add(this.turntable);
  }

  get current(): Creature | null {
    return this.creature;
  }

  /**
   * Show a genome. A full detail mesh takes tens of milliseconds, so while a
   * slider is moving the creature is rebuilt at lower detail a few times a
   * second, then once at full detail after the genome has settled.
   */
  setGenome(genome: Genome): void {
    const key = JSON.stringify(genome);
    const now = performance.now();
    if (!this.creature) {
      this.build(genome, key, true, now);
      return;
    }
    if (key !== this.wantKey) {
      // A lone change, like a generation hatching or Undo, goes straight to full detail.
      const lone = now - this.changedAt >= SETTLE_MS;
      this.wantKey = key;
      this.wantGenome = genome;
      this.changedAt = now;
      if (lone) {
        this.build(genome, key, true, now);
        return;
      }
    }
    if (this.wantKey === this.genomeKey && this.shownFull) return;
    if (now - this.changedAt >= SETTLE_MS) {
      this.build(this.wantGenome!, this.wantKey, true, now);
    } else if (this.wantKey !== this.genomeKey && now - this.lastBuild >= PREVIEW_INTERVAL_MS) {
      this.build(this.wantGenome!, this.wantKey, false, now);
    }
  }

  private build(genome: Genome, key: string, full: boolean, now: number): void {
    if (this.creature) {
      this.turntable.remove(this.creature.group);
      this.creature.group.traverse((o) => {
        const m = o as Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      for (const mat of this.creature.materials) mat.dispose();
    }
    this.creature = new Creature(genome, 0, full ? FULL_CELL : PREVIEW_CELL);
    this.creature.setMood(LAB_MOOD);
    this.turntable.add(this.creature.group);
    this.shadow.scale.setScalar(this.creature.plan.size);
    this.genomeKey = key;
    this.wantKey = key;
    this.wantGenome = genome;
    this.shownFull = full;
    this.lastBuild = now;
  }

  update(dt: number, state: SimState | null): void {
    if (state) {
      this.setGenome(this.showDraft ? state.draft : state.live);
      this.producing = state.speed === 0 ? 0.2 : Math.max(0.1, (state.live.traits.output / 100) * (1 - state.heatStress));
    }
    this.turntable.rotation.y += dt * TURN_RATE;

    // Idle behavior: mostly standing, with the odd look around or shuffle.
    const idle = this.idle;
    idle.timer -= dt;
    if (idle.timer <= 0) {
      const r = this.rng.next();
      if (r < 0.45) {
        idle.mode = 'look';
        idle.yawTarget = (this.rng.next() - 0.5) * 0.9;
        idle.left = 1.2;
      } else if (r < 0.75) {
        idle.mode = 'step';
        idle.left = 1.4;
      } else {
        idle.mode = 'stand';
        idle.left = 0;
      }
      idle.timer = 3 + this.rng.next() * 4;
    }
    let speed = 0;
    let turnRate = 0;
    if (idle.mode === 'look' && idle.left > 0) {
      const before = idle.yaw;
      idle.yaw += (idle.yawTarget - idle.yaw) * Math.min(1, dt * 4);
      turnRate = (idle.yaw - before) / Math.max(dt, 1e-4);
      idle.left -= dt;
    } else if (idle.mode === 'step' && idle.left > 0) {
      speed = 0.35;
      idle.left -= dt;
    } else {
      const before = idle.yaw;
      idle.yaw += (0 - idle.yaw) * Math.min(1, dt * 2);
      turnRate = (idle.yaw - before) / Math.max(dt, 1e-4);
    }
    if (this.creature) {
      this.creature.group.rotation.y = idle.yaw;
      this.creature.update(dt, { speed, turnRate, producing: this.producing });
    }
  }
}
