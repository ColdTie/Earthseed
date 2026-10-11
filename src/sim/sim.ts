import { Rng, seedFrom } from './rng';
import { getContract, getPlanet, getSpecies } from './data';
import { canAfford, cloneGenome, createGenome, editCost, setTrait as setGenomeTrait } from './genome';
import { drift } from './drift';
import { produce, resourcesFrom } from './economy';
import type { Action, LogEntry, Resources, SimState, TraitId, Traits } from './types';
import { TRAIT_IDS } from './types';

export const TICKS_PER_SECOND = 10;
const LOG_LIMIT = 40;

export interface SimOptions {
  seed: number;
  contractId?: string;
  /** Start paused. Tests use this so nothing ticks before they say so. */
  paused?: boolean;
}

export function createSim(opts: SimOptions): SimState {
  const contract = getContract(opts.contractId ?? 'kessraSeaWall');
  const planet = getPlanet(contract.planetId);
  const species = getSpecies(contract.speciesId);
  const rng = new Rng(seedFrom(opts.seed, 'sim'));
  const live = createGenome(species.id, seedFrom(opts.seed, 'lineage'));
  const state: SimState = {
    version: 1,
    seed: opts.seed >>> 0,
    tick: 0,
    speed: opts.paused ? 0 : 1,
    planetId: planet.id,
    contractId: contract.id,
    speciesId: species.id,
    generation: 1,
    generationTick: 0,
    live,
    draft: cloneGenome(live),
    resources: resourcesFrom(planet.stock),
    stabilize: false,
    calcite: 0,
    heatStress: 0,
    lastDrift: zeroTraits(),
    log: [],
    rngState: rng.state,
  };
  pushLog(state, {
    tick: 0,
    kind: 'info',
    view: 'galaxy',
    text: `${contract.client} asks for a ${contract.blueprint.material} wall. ${contract.conditions}`,
  });
  produce(state, species, planet);
  if (state.heatStress >= (species.stress?.crackThreshold ?? 1)) {
    pushLog(state, {
      tick: 0,
      kind: 'alert',
      view: 'organism',
      text: `Heat on ${planet.name} is above what the crew can take. Raise heat tolerance.`,
    });
  }
  return state;
}

export function zeroTraits(): Traits {
  const t = {} as Traits;
  for (const id of TRAIT_IDS) t[id] = 0;
  return t;
}

export function pushLog(state: SimState, entry: LogEntry): void {
  state.log.push(entry);
  if (state.log.length > LOG_LIMIT) state.log.splice(0, state.log.length - LOG_LIMIT);
}

/** The cost reserved against resources by the current draft. */
export function pendingCost(state: SimState): Partial<Resources> {
  return editCost(getSpecies(state.speciesId), state.live, state.draft);
}

/**
 * Apply a player action. Returns false when the action was refused, which
 * only happens when an edit cannot be paid for.
 */
export function applyAction(state: SimState, action: Action): boolean {
  switch (action.type) {
    case 'setSpeed':
      state.speed = action.speed;
      return true;
    case 'setStabilize':
      state.stabilize = action.on;
      return true;
    case 'resetDraft':
      state.draft = cloneGenome(state.live);
      return true;
    case 'setTrait': {
      const species = getSpecies(state.speciesId);
      if (!species.editable.includes(action.trait)) return false;
      const trial = cloneGenome(state.draft);
      setGenomeTrait(trial, action.trait, action.value);
      const cost = editCost(species, state.live, trial);
      if (!canAfford(state.resources, cost)) return false;
      state.draft = trial;
      return true;
    }
  }
}

/** Advance the simulation by one fixed tick. */
export function step(state: SimState): void {
  const species = getSpecies(state.speciesId);
  const planet = getPlanet(state.planetId);
  state.tick += 1;
  state.generationTick += 1;
  produce(state, species, planet);
  if (state.generationTick >= species.generationTicks) {
    nextGeneration(state);
  }
}

/** Advance by n ticks at the current speed. Paused means no ticks. */
export function stepMany(state: SimState, n: number): void {
  for (let i = 0; i < n; i++) step(state);
}

function nextGeneration(state: SimState): void {
  const species = getSpecies(state.speciesId);
  const planet = getPlanet(state.planetId);
  const rng = new Rng(state.rngState);

  // Pay for the edits that land now.
  const cost = editCost(species, state.live, state.draft);
  let paid = true;
  for (const [res, amount] of Object.entries(cost) as [keyof Resources, number][]) {
    if (state.resources[res] < amount) paid = false;
  }
  let landed = state.draft;
  if (!paid) {
    // Short on resources. Keep the live genes and tell the player why.
    landed = state.live;
    pushLog(state, {
      tick: state.tick,
      kind: 'alert',
      view: 'galaxy',
      text: 'Not enough resources to pay for the gene edits. They did not land this generation.',
    });
  } else {
    for (const [res, amount] of Object.entries(cost) as [keyof Resources, number][]) {
      state.resources[res] -= amount;
    }
  }

  // Stabilizing costs energy each generation. If it cannot be paid, drift runs free.
  let stabilized = false;
  if (state.stabilize) {
    const sc = species.stabilize.cost;
    if (canAfford(state.resources, sc)) {
      for (const [res, amount] of Object.entries(sc) as [keyof Resources, number][]) state.resources[res] -= amount;
      stabilized = true;
    } else {
      pushLog(state, { tick: state.tick, kind: 'alert', view: 'galaxy', text: 'No energy to steady drift this generation.' });
    }
  }

  const { next, shift } = drift(landed, species, planet, rng, stabilized);
  state.live = next;
  state.draft = cloneGenome(next);
  state.lastDrift = shift;
  state.generation += 1;
  state.generationTick = 0;
  state.rngState = rng.state;

  const biggest = (Object.entries(shift) as [TraitId, number][])
    .filter(([id]) => species.editable.includes(id))
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  const note = biggest ? ` ${species.traits[biggest[0]].label} drifted ${biggest[1] > 0 ? '+' : ''}${biggest[1]}.` : '';
  pushLog(state, { tick: state.tick, kind: 'info', view: 'organism', text: `Generation ${state.generation} hatched.${note}` });

  const threshold = species.stress?.crackThreshold ?? 1;
  const wasStressed = state.heatStress >= threshold;
  produce(state, species, planet);
  const isStressed = state.heatStress >= threshold;
  if (isStressed && !wasStressed) {
    pushLog(state, { tick: state.tick, kind: 'alert', view: 'organism', text: 'Heat is cracking fresh blocks again. Raise heat tolerance.' });
  } else if (!isStressed && wasStressed) {
    pushLog(state, { tick: state.tick, kind: 'done', view: 'swarm', text: 'The crew can take the heat now. New blocks hold.' });
  }
}

/** Save and load. Plain JSON, no classes. */
export function serialize(state: SimState): string {
  return JSON.stringify(state);
}

export function deserialize(text: string): SimState {
  const parsed = JSON.parse(text) as SimState;
  if (parsed.version !== 1) throw new Error('Unknown save version');
  return parsed;
}
