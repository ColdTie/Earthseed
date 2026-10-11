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
import { Dive } from './dive';
import type { SimState } from '../sim/types';

export class Stage {
  readonly renderer: Renderer;
  readonly views: Record<ViewId, View>;
  readonly organism: OrganismView;
  readonly galaxy: GalaxyView;
  readonly swarm: SwarmView;
  private labels: CSS2DRenderer;
  private fade: HTMLElement;
  private dive: Dive;
  /** The view drawn last frame, so enter and leave run once per change. */
  private drawn: View;
  /** When the current run of dives started, for timing. */
  private diveStartedAt = 0;
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
    this.dive = new Dive('organism');
    this.drawn = this.organism;
    this.applyPose(this.drawn.pose);
    this.renderer.setBloom(this.drawn.bloom, this.drawn.bloomThreshold);
    this.fade.style.background = this.drawn.background;
    this.fade.style.opacity = '0';

    window.addEventListener('keydown', (e) => {
      // Text fields keep their keys. Sliders do not use digits, so 1 2 3 still switch views.
      const t = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (t?.isContentEditable || t?.tagName === 'TEXTAREA' || (t instanceof HTMLInputElement && t.type !== 'range')) return;
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
    return this.dive.target;
  }

  get transitioning(): boolean {
    return this.dive.moving;
  }

  onViewChange(cb: (id: ViewId) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  go(id: ViewId): void {
    const wasMoving = this.dive.moving;
    if (!this.dive.go(id)) return;
    if (!wasMoving) this.diveStartedAt = performance.now();
    this.fade.style.background = this.views[id].background;
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

    const f = this.dive.advance(wallDt);
    const scene = this.views[f.shown];
    if (scene !== this.drawn) {
      this.drawn.onLeave?.();
      this.drawn = scene;
      this.renderer.setBloom(scene.bloom, scene.bloomThreshold);
      scene.onEnter?.();
    }
    if (f.leg === 'leave') {
      // Dive toward the focus when going deeper, pull back when going out.
      const from = this.views[f.from];
      this.lerpPose(from.pose, f.deeper ? from.divePose : from.farPose, f.t * 0.85);
    } else if (f.leg === 'arrive') {
      // Come in from far when going deeper, settle back when going out.
      const to = this.views[f.to];
      this.lerpPose(f.deeper ? to.farPose : to.divePose, to.pose, f.t);
    }
    this.fade.style.opacity = String(f.opacity);
    if (f.done) {
      this.lastTransitionMs = performance.now() - this.diveStartedAt;
      this.applyPose(scene.pose);
    }

    this.renderer.render(scene.scene, dt);
    this.labels.domElement.style.visibility = scene.id === 'galaxy' ? 'visible' : 'hidden';
    if (scene.id === 'galaxy') this.labels.render(scene.scene, this.renderer.camera);
  }
}
