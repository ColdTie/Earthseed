import { Color, PerspectiveCamera, Scene, WebGLRenderer, Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface RenderStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  frame: number;
}

/**
 * One renderer, one camera, one composer. Views hand it a scene to draw.
 * Bloom is restrained: only emissive parts cross the threshold.
 */
export class Renderer {
  readonly gl: WebGLRenderer;
  readonly camera: PerspectiveCamera;
  readonly composer: EffectComposer;
  readonly stats: RenderStats = { fps: 0, drawCalls: 0, triangles: 0, frame: 0 };
  private renderPass: RenderPass;
  private bloom: UnrealBloomPass;
  private fpsAccum = 0;
  private fpsCount = 0;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.gl = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    // Count draw calls across every pass, not just the last one.
    this.gl.info.autoReset = false;
    this.gl.setClearColor(new Color('#0b1424'), 1);
    this.camera = new PerspectiveCamera(36, 1, 0.05, 200);
    this.composer = new EffectComposer(this.gl);
    this.renderPass = new RenderPass(new Scene(), this.camera);
    this.bloom = new UnrealBloomPass(new Vector2(1, 1), 0.45, 0.5, 0.9);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.gl.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setBloom(strength: number, threshold = 0.9): void {
    this.bloom.strength = strength;
    this.bloom.threshold = threshold;
  }

  render(scene: Scene, dt: number): void {
    this.renderPass.scene = scene;
    this.gl.info.reset();
    this.composer.render();
    this.stats.drawCalls = this.gl.info.render.calls;
    this.stats.triangles = this.gl.info.render.triangles;
    this.stats.frame += 1;
    this.fpsAccum += dt;
    this.fpsCount += 1;
    if (this.fpsAccum >= 0.5) {
      this.stats.fps = Math.round(this.fpsCount / this.fpsAccum);
      this.fpsAccum = 0;
      this.fpsCount = 0;
    }
  }
}
