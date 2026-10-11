import type { PlanetSpec, Resources, SimState, SpeciesSpec, Traits } from './types';
import { editCost, remaining } from './genome';
import { RESOURCE_IDS } from './types';

export function emptyResources(): Resources {
  const r = {} as Resources;
  for (const id of RESOURCE_IDS) r[id] = 0;
  return r;
}

export function resourcesFrom(partial: Partial<Resources> | undefined): Resources {
  const r = emptyResources();
  if (partial) for (const [k, v] of Object.entries(partial)) r[k as keyof Resources] = v;
  return r;
}

/**
 * Heat stress, 0 to 1. How far the planet's heat exceeds the crew's
 * tolerance, as a fraction of the trait range. On Kessra (heat 75) a crew
 * with tolerance 35 runs at 0.4 stress; tolerance 60 brings it to 0.15,
 * just under the crack threshold in species.json.
 */
export function heatStress(traits: Traits, planet: PlanetSpec): number {
  const gap = planet.climate.heat - traits.heatTolerance;
  return Math.max(0, Math.min(1, gap / 100));
}

export function coldStress(traits: Traits, planet: PlanetSpec): number {
  const gap = planet.climate.cold - traits.coldTolerance;
  return Math.max(0, Math.min(1, gap / 100));
}

/** Crew output this tick, after stress. Writes calcite and spends inputs. */
export function produce(state: SimState, species: SpeciesSpec, planet: PlanetSpec): void {
  const traits = state.live.traits;
  const stress = heatStress(traits, planet);
  state.heatStress = stress;
  const prod = species.production;
  const perWorker = prod.calcitePerWorkerPerTick ?? 0;
  if (perWorker > 0) {
    const workers = species.workers;
    const efficiency = (traits.output / 100) * (1 - stress);
    const wanted = workers * perWorker * efficiency;
    const calciumNeeded = wanted * (prod.calciumPerCalcite ?? 0);
    const feedNeeded = workers * (prod.feedPerWorkerPerTick ?? 0);
    // The crew only draws on what an accepted gene edit has not reserved, so
    // the edit can always be paid when the generation turns. It also leaves a
    // small reserve untouched, so the player can always afford a correction.
    const avail = remaining(remaining(state.resources, editCost(species, state.live, state.draft)), species.reserve ?? {});
    const calciumFrac = calciumNeeded > 0 ? Math.min(1, avail.calcium / calciumNeeded) : 1;
    const feedFrac = feedNeeded > 0 ? Math.min(1, avail.feed / feedNeeded) : 1;
    const frac = Math.min(calciumFrac, feedFrac);
    state.calcite += wanted * frac;
    state.resources.calcium = Math.max(0, state.resources.calcium - calciumNeeded * frac);
    state.resources.feed = Math.max(0, state.resources.feed - feedNeeded * frac);
  }
  if (planet.income) {
    for (const [k, v] of Object.entries(planet.income)) {
      state.resources[k as keyof Resources] += v;
    }
  }
}
