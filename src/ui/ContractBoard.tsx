import type { Game } from './store';
import type { SimState } from '../sim/types';
import { CONTRACTS, getPlanet } from '../sim/data';
import { LogList } from './LogList';

export function ContractBoard({ game, state }: { game: Game; state: SimState }) {
  return (
    <aside class="panel" aria-label="Contract board">
      <h2>Contract board</h2>
      <p class="sub">Client species post what they need. Problems start here and get solved at the organism scale.</p>
      {Object.values(CONTRACTS).map((c) => {
        const planet = getPlanet(c.planetId);
        const active = c.id === state.contractId;
        const locked = c.status === 'locked';
        return (
          <div key={c.id} class={'contract' + (locked ? ' locked' : '')}>
            <h4>
              {c.title} {active && '· active'} {locked && '· locked'}
            </h4>
            <p>{locked ? 'Opens when the first wall stands.' : `“${c.request}”`}</p>
            <div class="meta">
              {planet.name} · {c.conditions} · {c.workers} workers · {c.blueprint.length}×{c.blueprint.height} blocks
            </div>
          </div>
        );
      })}
      <h3>Seed ships</h3>
      <p class="hint">One route is open: Hollow Reach carries feed to Kessra. Real travel time and cargo arrive with the next milestone.</p>
      <h3>Recent</h3>
      <LogList game={game} state={state} limit={4} />
    </aside>
  );
}
