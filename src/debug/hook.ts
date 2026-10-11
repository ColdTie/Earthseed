/**
 * window.__seedlings: the handle tests use to drive the game without a
 * person. Jump to a view, fast forward ticks, set a seed, read state.
 */
import type { GameClient } from '../app/client';
import type { Stage } from '../app/stage';
import type { SimState, TraitId, Speed } from '../sim/types';
import type { ViewId } from '../render/view';
import type { RenderStats } from '../render/renderer';

export interface SeedlingsDebug {
  ready: Promise<void>;
  getState(): SimState | null;
  getView(): ViewId;
  setView(id: ViewId): Promise<void>;
  tick(n: number): Promise<SimState>;
  setSeed(seed: number, paused?: boolean): Promise<SimState>;
  setTrait(trait: TraitId, value: number): void;
  setSpeed(speed: Speed): void;
  freeze(on: boolean): void;
  stats(): RenderStats & { bodyVertices: number; creatureDrawCalls: number; lastTransitionMs: number };
  errors: string[];
  version: string;
}

declare global {
  interface Window {
    __seedlings: SeedlingsDebug;
  }
}

export function installDebugHook(client: GameClient, stage: Stage, version: string): SeedlingsDebug {
  const errors: string[] = [];
  window.addEventListener('error', (e) => errors.push(String(e.message)));
  window.addEventListener('unhandledrejection', (e) => errors.push(String(e.reason)));

  const hook: SeedlingsDebug = {
    ready: client.ready.then(() => undefined),
    getState: () => client.state,
    getView: () => stage.current,
    setView: (id) =>
      new Promise((resolve) => {
        stage.go(id);
        const check = () => (stage.transitioning ? requestAnimationFrame(check) : resolve());
        requestAnimationFrame(check);
      }),
    tick: (n) => client.fastForward(n),
    setSeed: (seed, paused = false) => {
      client.newGame(seed, paused);
      return new Promise((resolve) => {
        const off = client.subscribe((s) => {
          off();
          resolve(s);
        });
      });
    },
    setTrait: (trait, value) => client.dispatch({ type: 'setTrait', trait, value }),
    setSpeed: (speed) => client.dispatch({ type: 'setSpeed', speed }),
    freeze: (on) => {
      stage.timeScale = on ? 0 : 1;
    },
    stats: () => ({
      ...stage.renderer.stats,
      bodyVertices: stage.organism.current?.bodyVertices ?? 0,
      creatureDrawCalls: stage.organism.current?.drawCalls ?? 0,
      lastTransitionMs: stage.lastTransitionMs,
    }),
    errors,
    version,
  };
  window.__seedlings = hook;
  return hook;
}
