/// <reference lib="webworker" />
import { applyAction, createSim, stepMany, type SimOptions } from './sim';
import { TICKS_PER_SECOND } from './sim';
import type { Action, SimState } from './types';

export type ToWorker =
  | { type: 'init'; options: SimOptions }
  | { type: 'action'; action: Action }
  | { type: 'fastForward'; ticks: number; id: number }
  | { type: 'load'; state: SimState }
  | { type: 'snapshot' };

export type FromWorker =
  | { type: 'snapshot'; state: SimState }
  | { type: 'fastForwarded'; id: number; state: SimState }
  | { type: 'refused'; action: Action };

let state: SimState | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let carry = 0;
let last = 0;

const port: { postMessage: (m: FromWorker) => void } = self as unknown as { postMessage: (m: FromWorker) => void };

function send(): void {
  if (state) port.postMessage({ type: 'snapshot', state });
}

function start(): void {
  if (timer) clearInterval(timer);
  last = performance.now();
  carry = 0;
  timer = setInterval(() => {
    if (!state) return;
    const now = performance.now();
    const dt = Math.min(0.5, (now - last) / 1000);
    last = now;
    carry += dt * TICKS_PER_SECOND * state.speed;
    const n = Math.floor(carry);
    carry -= n;
    if (n > 0) stepMany(state, n);
    send();
  }, 1000 / TICKS_PER_SECOND);
}

self.onmessage = (ev: MessageEvent<ToWorker>) => {
  const msg = ev.data;
  switch (msg.type) {
    case 'init':
      state = createSim(msg.options);
      start();
      send();
      break;
    case 'load':
      state = msg.state;
      start();
      send();
      break;
    case 'action':
      if (state && !applyAction(state, msg.action)) port.postMessage({ type: 'refused', action: msg.action });
      send();
      break;
    case 'fastForward':
      if (state) {
        stepMany(state, msg.ticks);
        port.postMessage({ type: 'fastForwarded', id: msg.id, state });
      }
      break;
    case 'snapshot':
      send();
      break;
  }
};
