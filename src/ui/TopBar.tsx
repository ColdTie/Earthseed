import type { Game } from './store';
import type { ResourceId, SimState, Speed } from '../sim/types';
import type { ViewId } from '../render/view';
import { pendingCost } from '../sim/sim';
import resources from '../../data/resources.json';

const VIEWS: { id: ViewId; key: string; label: string }[] = [
  { id: 'galaxy', key: '3', label: 'Galaxy' },
  { id: 'swarm', key: '2', label: 'Swarm' },
  { id: 'organism', key: '1', label: 'Organism' },
];

const SPEEDS: { v: Speed; label: string }[] = [
  { v: 0, label: 'Pause' },
  { v: 1, label: '1×' },
  { v: 2, label: '2×' },
  { v: 4, label: '4×' },
];

const SHOWN: ResourceId[] = ['energy', 'feed', 'calcium'];

export function TopBar({ game, state, view }: { game: Game; state: SimState | null; view: ViewId }) {
  const pending = state ? pendingCost(state) : {};
  return (
    <div class="topbar">
      <div class="brand">
        <span class="seed" aria-hidden="true" />
        Seedlings
      </div>
      <div class="tabs" role="tablist" aria-label="Views">
        {VIEWS.map((v) => (
          <button key={v.id} class={'tab' + (view === v.id ? ' active' : '')} role="tab" aria-selected={view === v.id} onClick={() => game.stage.go(v.id)}>
            <kbd>{v.key}</kbd>
            {v.label}
          </button>
        ))}
      </div>
      <div class="spacer" />
      {state && (
        <div class="resources" aria-label="Resources">
          {SHOWN.map((id) => {
            const meta = resources[id];
            const reserved = pending[id] ?? 0;
            return (
              <div class="chip" key={id} title={meta.label}>
                <span class="dot" style={{ background: meta.color, boxShadow: '0 0 0 1px rgba(0,0,0,0.15) inset' }} />
                <small>{meta.label}</small>
                {Math.floor(state.resources[id])}
                {reserved > 0 && <span class="pending">−{reserved}</span>}
              </div>
            );
          })}
        </div>
      )}
      <div class="speed" role="group" aria-label="Speed">
        {SPEEDS.map((s) => (
          <button key={s.v} class={state?.speed === s.v ? 'active' : ''} onClick={() => game.client.dispatch({ type: 'setSpeed', speed: s.v })} aria-pressed={state?.speed === s.v}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
