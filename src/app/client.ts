/**
 * Main thread side of the simulation. Talks to the worker, keeps the latest
 * snapshot, and saves to browser storage. Rendering reads snapshots from
 * here and never changes game state.
 */
import type { Action, SimState } from '../sim/types';
import type { FromWorker, ToWorker } from '../sim/worker';
import { deserialize, serialize } from '../sim/sim';

const SAVE_KEY = 'seedlings.save.v1';

type Listener = (state: SimState) => void;

export class GameClient {
  private worker: Worker;
  private listeners = new Set<Listener>();
  private pending = new Map<number, (s: SimState) => void>();
  private nextId = 1;
  private saveTimer = 0;
  state: SimState | null = null;
  /** The last action the sim refused, and when, for the UI to explain. */
  refused: Action | null = null;
  refusedAt = 0;
  readonly ready: Promise<SimState>;
  private resolveReady!: (s: SimState) => void;

  constructor() {
    this.worker = new Worker(new URL('../sim/worker.ts', import.meta.url), { type: 'module' });
    this.ready = new Promise<SimState>((resolve) => (this.resolveReady = resolve));
    this.worker.onmessage = (ev: MessageEvent<FromWorker>) => {
      const msg = ev.data;
      switch (msg.type) {
        case 'snapshot':
          this.accept(msg.state);
          break;
        case 'fastForwarded': {
          this.accept(msg.state);
          const cb = this.pending.get(msg.id);
          if (cb) {
            this.pending.delete(msg.id);
            cb(msg.state);
          }
          break;
        }
        case 'refused':
          // A snapshot follows right away, which re-renders the panel.
          this.refused = msg.action;
          this.refusedAt = performance.now();
          break;
      }
    };
  }

  private accept(state: SimState): void {
    const first = this.state === null;
    this.state = state;
    if (first) this.resolveReady(state);
    for (const l of this.listeners) l(state);
    this.saveTimer += 1;
    if (this.saveTimer >= 50) {
      this.saveTimer = 0;
      this.save();
    }
  }

  private post(msg: ToWorker): void {
    this.worker.postMessage(msg);
  }

  newGame(seed: number, paused = false): void {
    this.state = null;
    this.post({ type: 'init', options: { seed, paused } });
  }

  load(state: SimState): void {
    this.state = null;
    this.post({ type: 'load', state });
  }

  dispatch(action: Action): void {
    this.post({ type: 'action', action });
  }

  /** Step the sim by a number of ticks right away, whatever the speed. */
  fastForward(ticks: number): Promise<SimState> {
    const id = this.nextId++;
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.post({ type: 'fastForward', ticks, id });
    });
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  save(): void {
    if (!this.state) return;
    try {
      localStorage.setItem(SAVE_KEY, serialize(this.state));
    } catch {
      // Storage may be blocked. The game keeps running without saves.
    }
  }

  static loadSaved(): SimState | null {
    try {
      const text = localStorage.getItem(SAVE_KEY);
      return text ? deserialize(text) : null;
    } catch {
      return null;
    }
  }

  static clearSaved(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Nothing to do.
    }
  }

  exportJson(): string {
    return this.state ? serialize(this.state) : '';
  }
}
