import { useRef, useState } from 'preact/hooks';
import type { Game } from './store';
import type { ResourceId, SimState, TraitId } from '../sim/types';
import { getPlanet, getSpecies } from '../sim/data';
import { pendingCost } from '../sim/sim';
import { cloneGenome, editCost, setTrait, tensionPartner } from '../sim/genome';
import resources from '../../data/resources.json';
import { LogList } from './LogList';

const REFUSED_SHOW_MS = 2500;
const PENDING_MS = 300;

/** Which resources fall short for moving `trait` to `value` from the current draft. */
function shortOf(state: SimState, trait: TraitId, value: number): string[] {
  const species = getSpecies(state.speciesId);
  const trial = cloneGenome(state.draft);
  setTrait(trial, trait, value);
  const cost = editCost(species, state.live, trial);
  return (Object.entries(cost) as [ResourceId, number][])
    .filter(([r, v]) => state.resources[r] < v)
    .map(([r]) => resources[r].label.toLowerCase());
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function TraitSlider({ game, state, trait }: { game: Game; state: SimState; trait: TraitId }) {
  const species = getSpecies(state.speciesId);
  const spec = species.traits[trait];
  const live = state.live.traits[trait];
  const draft = state.draft.traits[trait];
  const partner = tensionPartner(species, trait);
  // The value the player just set, shown until the sim's reply arrives. Clearing it
  // on 'change' instead would drop steps when keys repeat faster than replies.
  const [pending, setPending] = useState<{ v: number; at: number } | null>(null);
  // If the sim refused this slider's last move, show where it really is and say why.
  // A refusal only counts if it answers this slider's latest move; a newer
  // move clears it.
  const now = performance.now();
  const refused = game.client.refused;
  const refusedAt = game.client.refusedAt;
  const short =
    refused?.type === 'setTrait' &&
    refused.trait === trait &&
    now - refusedAt < REFUSED_SHOW_MS &&
    (pending === null || refusedAt >= pending.at)
      ? shortOf(state, trait, refused.value)
      : [];
  const fresh = pending !== null && now - pending.at < PENDING_MS;
  const shown = short.length > 0 || !fresh ? draft : pending.v;
  const delta = Math.round(draft - live);
  const drift = state.lastDrift[trait];
  const costText = (Object.entries(spec.editCost) as [ResourceId, number][])
    .map(([r, v]) => `${v} ${resources[r].label.toLowerCase()} per point`)
    .join(', ');
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div class="trait">
      <div class="row">
        <label for={`trait-${trait}`}>{spec.label}</label>
        <span class="val">
          {fmt(shown)}
          {delta !== 0 && <span class="delta">{delta > 0 ? '+' : ''}{delta} next gen</span>}
        </span>
      </div>
      <div class="track">
        <input
          ref={ref}
          id={`trait-${trait}`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={shown}
          onInput={(e) => {
            const v = Number((e.currentTarget as HTMLInputElement).value);
            setPending({ v, at: performance.now() });
            game.client.dispatch({ type: 'setTrait', trait, value: v });
          }}
          aria-valuetext={`${spec.label} ${fmt(shown)}`}
        />
        <span class="live" style={{ left: `calc(${live}% + ${8 - live * 0.16}px)` }} title={`Live generation: ${fmt(live)}`} />
      </div>
      {short.length > 0 && (
        <div class="refused" role="status">
          <span class="icon warn" aria-hidden="true">!</span>
          Not enough {short.join(' or ')} for that edit.
        </div>
      )}
      <div class="note">
        <span>{partner ? `Pulls against ${species.traits[partner].label.toLowerCase()}` : 'No partner'} · {costText}</span>
        <span class="drift" title="How far this trait drifted when the last generation hatched">
          drift {drift > 0 ? '+' : ''}{fmt(drift)}
        </span>
      </div>
    </div>
  );
}

export function GeneEditor({ game, state }: { game: Game; state: SimState }) {
  const species = getSpecies(state.speciesId);
  const planet = getPlanet(state.planetId);
  const cost = pendingCost(state);
  const costEntries = Object.entries(cost) as [ResourceId, number][];
  const ticksLeft = species.generationTicks - state.generationTick;
  const secondsLeft = Math.ceil(ticksLeft / 10);
  const progress = (state.generationTick / species.generationTicks) * 100;
  const threshold = species.stress?.crackThreshold ?? 1;
  const stressed = state.heatStress >= threshold;
  const stabCost = Object.entries(species.stabilize.cost) as [ResourceId, number][];
  const hasEdits = costEntries.length > 0;
  const draftStressed = Math.max(0, planet.climate.heat - state.draft.traits.heatTolerance) / 100 >= threshold;

  return (
    <aside class="panel" aria-label="Gene editor">
      <h2>{species.name}</h2>
      <p class="sub">{species.summary} Based on {species.basis.split('.')[0]}.</p>

      <div class="gen">
        <strong>Generation {state.generation}</strong>
        <span>next in {secondsLeft}s at 1×</span>
      </div>
      <div class="bar"><i style={{ width: `${progress}%` }} /></div>

      <div class="stress-row">
        <span class={'icon ' + (stressed ? 'warn' : 'ok')} aria-hidden="true">{stressed ? '!' : '✓'}</span>
        <span>
          {stressed
            ? `Heat on ${planet.name} is cracking fresh blocks. Crew loses ${Math.round(state.heatStress * 100)}% of its work.`
            : `The crew can take the heat on ${planet.name}. ${Math.round(state.heatStress * 100)}% of work lost.`}
        </span>
      </div>
      <div class={'bar stress' + (stressed ? '' : ' ok')}><i style={{ width: `${Math.min(100, state.heatStress * 100)}%` }} /></div>
      {stressed && !draftStressed && <p class="hint">Your edit fixes this when the next generation hatches.</p>}

      <h3>Traits</h3>
      {species.editable.map((t) => (
        <TraitSlider key={t} game={game} state={state} trait={t} />
      ))}

      <div class="cost">
        {hasEdits ? (
          <>
            Edits land next generation and will cost{' '}
            {costEntries.map(([r, v], i) => (
              <span key={r}>
                {i > 0 && ', '}
                <b>{v} {resources[r].label.toLowerCase()}</b>
              </span>
            ))}
            .
          </>
        ) : (
          'Move a slider. Edits land on the next generation and cost resources.'
        )}
      </div>
      <div class="actions">
        <button class="btn" disabled={!hasEdits} onClick={() => game.client.dispatch({ type: 'resetDraft' })}>
          Undo edits
        </button>
        <button
          class={'btn' + (state.stabilize ? ' on' : '')}
          onClick={() => game.client.dispatch({ type: 'setStabilize', on: !state.stabilize })}
          aria-pressed={state.stabilize}
          title="Spend energy every generation to halve drift. It never stops."
        >
          {state.stabilize ? 'Steadying drift' : 'Steady drift'} ({stabCost.map(([r, v]) => `${v} ${resources[r].label.toLowerCase()}`).join(', ')}/gen)
        </button>
      </div>

      <h3>Recent</h3>
      <LogList game={game} state={state} limit={4} />
    </aside>
  );
}
