import { getSpecies } from './data';
import { TRAIT_IDS, type Genome, type ResourceId, type Resources, type SpeciesSpec, type TraitId, type Traits } from './types';

export const TRAIT_MIN = 0;
export const TRAIT_MAX = 100;

export function clampTrait(v: number): number {
  return Math.min(TRAIT_MAX, Math.max(TRAIT_MIN, v));
}

export function defaultTraits(species: SpeciesSpec): Traits {
  const t = {} as Traits;
  for (const id of TRAIT_IDS) t[id] = species.traits[id].default;
  return t;
}

export function createGenome(speciesId: string, seed: number): Genome {
  const species = getSpecies(speciesId);
  return { seed: seed >>> 0, speciesId, traits: defaultTraits(species) };
}

export function cloneGenome(g: Genome): Genome {
  return { seed: g.seed, speciesId: g.speciesId, traits: { ...g.traits } };
}

/** The partner a trait pulls against, if it has one. */
export function tensionPartner(species: SpeciesSpec, trait: TraitId): TraitId | null {
  for (const [a, b] of species.tensionPairs) {
    if (a === trait) return b;
    if (b === trait) return a;
  }
  return null;
}

/** Round to hundredths. Half steps of whole or tenth values stay exact. */
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * Set one trait on a genome. Its tension partner moves the other way by
 * tensionRatio. Returns the traits that changed.
 *
 * The partner is never rounded to a whole number, so many small steps land
 * exactly where one big jump does. The move is cut short when the partner
 * would leave 0..100, so moving a slider back always undoes it exactly.
 */
export function setTrait(genome: Genome, trait: TraitId, value: number): Partial<Traits> {
  const species = getSpecies(genome.speciesId);
  const ratio = species.tensionRatio;
  const old = genome.traits[trait];
  let delta = clampTrait(Math.round(value)) - old;
  const partner = tensionPartner(species, trait);
  if (partner && ratio > 0) {
    const p = genome.traits[partner];
    const room = delta > 0 ? (p - TRAIT_MIN) / ratio : (p - TRAIT_MAX) / ratio;
    if (Math.abs(delta) > Math.abs(room)) delta = room;
  }
  const next = clampTrait(round2(old + delta));
  delta = next - old;
  if (delta === 0) return {};
  const changed: Partial<Traits> = {};
  genome.traits[trait] = next;
  changed[trait] = next;
  if (partner) {
    const p = clampTrait(round2(genome.traits[partner] - delta * ratio));
    genome.traits[partner] = p;
    changed[partner] = p;
  }
  return changed;
}

/** Resource cost of taking the live genome to the draft. */
export function editCost(species: SpeciesSpec, live: Genome, draft: Genome): Partial<Resources> {
  const cost: Partial<Resources> = {};
  for (const id of TRAIT_IDS) {
    const d = Math.abs(draft.traits[id] - live.traits[id]);
    if (d === 0) continue;
    for (const [res, perPoint] of Object.entries(species.traits[id].editCost) as [ResourceId, number][]) {
      cost[res] = (cost[res] ?? 0) + d * perPoint;
    }
  }
  for (const k of Object.keys(cost) as ResourceId[]) cost[k] = Math.round((cost[k] ?? 0) * 10) / 10;
  return cost;
}

export function canAfford(resources: Resources, cost: Partial<Resources>): boolean {
  for (const [res, amount] of Object.entries(cost) as [ResourceId, number][]) {
    if ((resources[res] ?? 0) < amount) return false;
  }
  return true;
}

/** Resources left after reserving a cost. Never below zero. */
export function remaining(resources: Resources, cost: Partial<Resources>): Resources {
  const out = { ...resources };
  for (const [res, amount] of Object.entries(cost) as [ResourceId, number][]) {
    out[res] = Math.max(0, out[res] - amount);
  }
  return out;
}
