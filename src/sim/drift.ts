import { Rng } from './rng';
import { clampTrait } from './genome';
import { TRAIT_IDS, type Genome, type PlanetSpec, type SpeciesSpec, type Traits } from './types';

/**
 * Mutation drift. Each generation every trait shifts by a small random
 * amount plus a nudge from the environment:
 *
 *   trait_next = trait + N(0, sigma) + pressure_env
 *
 * Stabilizing scales sigma down but never to zero. Change cannot be stopped,
 * only shaped.
 */
export function drift(
  genome: Genome,
  species: SpeciesSpec,
  planet: PlanetSpec,
  rng: Rng,
  stabilized: boolean,
): { next: Genome; shift: Traits } {
  const factor = stabilized ? species.stabilize.sigmaFactor : 1;
  const next: Genome = { seed: genome.seed, speciesId: genome.speciesId, traits: { ...genome.traits } };
  const shift = {} as Traits;
  for (const id of TRAIT_IDS) {
    const sigma = species.traits[id].sigma * factor;
    const pressure = planet.pressure[id] ?? 0;
    const raw = rng.gaussian(sigma) + pressure;
    const before = genome.traits[id];
    const after = clampTrait(Math.round((before + raw) * 10) / 10);
    next.traits[id] = after;
    shift[id] = Math.round((after - before) * 10) / 10;
  }
  return { next, shift };
}
