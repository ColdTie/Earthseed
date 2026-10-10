import type { Game } from './store';
import type { SimState } from '../sim/types';
import { getContract, getPlanet, getSpecies } from '../sim/data';
import { LogList } from './LogList';

export function SitePanel({ game, state }: { game: Game; state: SimState }) {
  const contract = getContract(state.contractId);
  const planet = getPlanet(state.planetId);
  const species = getSpecies(state.speciesId);
  const threshold = species.stress?.crackThreshold ?? 1;
  const stressed = state.heatStress >= threshold;
  return (
    <aside class="panel" aria-label="Build site">
      <h2>{contract.title}</h2>
      <p class="sub">
        {planet.name}. {contract.conditions} The outline shows the wall the tide council asked for.
      </p>
      <div class="stress-row">
        <span class={'icon ' + (stressed ? 'warn' : 'ok')} aria-hidden="true">{stressed ? '!' : '✓'}</span>
        <span>{stressed ? 'Fresh blocks are cracking in the heat. The fix lives in the organism view.' : 'Blocks are holding in the heat.'}</span>
      </div>
      <div class="gen">
        <strong>Calcite laid</strong>
        <span>{Math.floor(state.calcite)} units</span>
      </div>
      <p class="hint">
        {species.workers} {species.name.toLowerCase()}s are on contract. Watching them build, block by block, is the next thing being made.
      </p>
      <h3>Markers</h3>
      <div class="actions">
        <button class="btn" disabled>Build here</button>
        <button class="btn" disabled>Avoid</button>
        <button class="btn" disabled>Feed station</button>
      </div>
      <p class="hint">Markers come with the crew.</p>
      <h3>Recent</h3>
      <LogList game={game} state={state} limit={4} />
    </aside>
  );
}
