import { render, h } from 'preact';
import './ui/styles.css';
import { GameClient } from './app/client';
import { Stage } from './app/stage';
import { App } from './ui/App';
import { installDebugHook } from './debug/hook';
import type { ViewId } from './render/view';

const VERSION = '0.1.0';
const DEFAULT_SEED = 20261010;

function boot(): void {
  const canvas = document.getElementById('scene') as HTMLCanvasElement;
  const fade = document.getElementById('fade') as HTMLElement;
  const uiRoot = document.getElementById('ui') as HTMLElement;
  const labelRoot = document.createElement('div');
  labelRoot.id = 'labels';
  document.body.insertBefore(labelRoot, uiRoot);

  const params = new URLSearchParams(location.search);
  const seedParam = params.get('seed');
  const fresh = params.has('fresh') || seedParam !== null;

  const client = new GameClient();
  const saved = fresh ? null : GameClient.loadSaved();
  if (saved) client.load(saved);
  else client.newGame(seedParam ? Number(seedParam) >>> 0 : DEFAULT_SEED, params.has('paused'));

  const stage = new Stage(canvas, fade, labelRoot);
  const startView = params.get('view') as ViewId | null;
  if (startView && (startView === 'galaxy' || startView === 'swarm' || startView === 'organism')) {
    // Jump without the dive on first load.
    stage.go(startView);
  }

  installDebugHook(client, stage, VERSION);
  render(h(App, { game: { client, stage } }), uiRoot);

  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    stage.frame(dt, client.state);
    if (stage.running) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) client.save();
  });
  window.addEventListener('beforeunload', () => client.save());
}

boot();
