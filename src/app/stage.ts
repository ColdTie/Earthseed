/**
 * The stage owns the renderer and the three views, and moves the camera
 * between them. The camera dives: galaxy into a planet, down to the build
 * site, into a single creature. Never a hard cut.
 */
import { Vector3 } from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Renderer } from '../render/renderer';
import { GalaxyView } from '../render/galaxy';
import { SwarmView } from '../render/swarm';
import { OrganismView } from '../render/organism';
import { VIEW_DEPTH, type CameraPose, type View, type ViewId } from '../render/view';
import type { SimState } from '../sim/types';

const TRANSITION_SECONDS = 0.85;

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface Transition {
  from: View;
  to: View;
  elapsed: number;
  deeper: boolean;
  startedAt: number;
}

export class Stage {
  readonly renderer: Renderer;
  readonly views: Record<ViewId, View>;
  readonly organism: OrganismView;
  readonly galaxy: GalaxyView;
  readonly swarm: SwarmView;
  private labels: CSS2DRenderer;
  private fade: HTMLElement;
  private active: View;
  private transition: Transition | null = null;
  private pos = new Vector3();
  private target = new Vector3();
  private listeners = new Set<(id: ViewId) => void>();
  private lastWheel = 0;
  /** Set to false to stop the loop, for tests. */
  running = true;
  /** Scales time for the animation. Zero freezes motion for screenshots. */
  timeScale = 1;
  /** Wall clock length of the last finished dive, in milliseconds. */
  lastTransitionMs = 0;

  constructor(canvas: HTMLCanvasElement, fade: HTMLElement, labelRoot: HTMLElement) {
    this.renderer = new Renderer(canvas);
    this.galaxy = new GalaxyView();
    this.swarm = new SwarmView();
    this.organism = new OrganismView();
    this.views = { galaxy: this.galaxy, swarm: this.swarm, organism: this.organism };
    this.fade = fade;
    this.labels = new CSS2DRenderer({ element: labelRoot });
    this.labels.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', () => this.labels.setSize(window.innerWidth, window.innerHeight));
    this.active = this.organism;
    this.applyPose(this.active.pose);
    this.renderer.setBloom(this.active.bloom, this.active.bloomThreshold);
    this.fade.style.background = this.active.background;
    this.fade.style.opacity = '0';

    window.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
      if (e.key === '1') this.go('organism');
      if (e.key === '2') this.go('swarm');
      if (e.key === '3') this.go('galaxy');
    });
    window.addEventListener(
      'wheel',
      (e) => {
        if ((e.target as HTMLElement | null)?.closest('.panel')) return;
        const now = performance.now();
        if (now - this.lastWheel < 900 || Math.abs(e.deltaY) < 12) return;
        this.lastWheel = now;
        const depth = VIEW_DEPTH[this.current];
        if (e.deltaY > 0 && depth < 3) this.go(depth === 1 ? 'swarm' : 'galaxy');
        if (e.deltaY < 0 && depth > 1) this.go(depth === 3 ? 'swarm' : 'organism');
      },
      { passive: true },
    );
  }

  get current(): ViewId {
    return this.transition ? this.transition.to.id : this.active.id;
  }

  get transitioning(): boolean {
    return this.transition !== null;
  }

  onViewChange(cb: (id: ViewId) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  go(id: ViewId): void {
    if (id === this.current) return;
    const to = this.views[id];
    const from = this.transition ? this.transition.to : this.active;
    this.transition = { from, to, elapsed: 0, deeper: VIEW_DEPTH[to.id] < VIEW_DEPTH[from.id], startedAt: performance.now() };
    this.fade.style.background = to.background;
    for (const l of this.listeners) l(id);
  }

  private applyPose(p: CameraPose): void {
    this.pos.copy(p.position);
    this.target.copy(p.target);
    this.renderer.camera.position.copy(this.pos);
    this.renderer.camera.lookAt(this.target);
  }

  private lerpPose(a: CameraPose, b: CameraPose, t: number): void {
    this.pos.lerpVectors(a.position, b.position, t);
    this.target.lerpVectors(a.target, b.target, t);
    this.renderer.camera.position.copy(this.pos);
    this.renderer.camera.lookAt(this.target);
  }

  private lastFrameAt = 0;

  /** One frame. dt in seconds. */
  frame(dt: number, state: SimState | null): void {
    const sdt = dt * this.timeScale;
    // Transitions run on wall clock time so they finish on time on slow machines.
    const now = performance.now();
    const wallDt = this.lastFrameAt ? Math.min(1, (now - this.lastFrameAt) / 1000) : dt;
    this.lastFrameAt = now;
    for (const v of Object.values(this.views)) v.update(sdt, state);

    let scene = this.active;
    if (this.transition) {
      const tr = this.transition;
      tr.elapsed += wallDt;
      const u = Math.min(1, tr.elapsed / TRANSITION_SECONDS);
      const half = 0.5;
      if (u < half) {
        // Leave: dive toward the focus when going deeper, pull back when going out.
        const t = easeInOut(u / half);
        const leaveTo = tr.deeper ? tr.from.divePose : tr.from.farPose;
        this.lerpPose(tr.from.pose, leaveTo, t * 0.85);
        this.fade.style.opacity = String(Math.min(1, t * 1.15));
        scene = tr.from;
      } else {
        // Arrive: come in from far when going deeper, settle back when going out.
        const t = easeInOut((u - half) / half);
        const arriveFrom = tr.deeper ? tr.to.farPose : tr.to.divePose;
        this.lerpPose(arriveFrom, tr.to.pose, t);
        this.fade.style.opacity = String(Math.max(0, 1 - t * 1.25));
        scene = tr.to;
        if (this.active !== tr.to) {
          this.active.onLeave?.();
          this.active = tr.to;
          this.renderer.setBloom(tr.to.bloom, tr.to.bloomThreshold);
          tr.to.onEnter?.();
        }
      }
      if (u >= 1) {
        this.lastTransitionMs = performance.now() - tr.startedAt;
        this.transition = null;
        this.applyPose(tr.to.pose);
        this.fade.style.opacity = '0';
      }
    }

    this.renderer.render(scene.scene, dt);
    this.labels.domElement.style.visibility = scene.id === 'galaxy' ? 'visible' : 'hidden';
    if (scene.id === 'galaxy') this.labels.render(scene.scene, this.renderer.camera);
  }
}
