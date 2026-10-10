import speciesJson from '../../data/species.json';
import planetsJson from '../../data/planets.json';
import contractsJson from '../../data/contracts.json';
import type { ContractSpec, PlanetSpec, SpeciesSpec } from './types';

export const SPECIES = speciesJson as unknown as Record<string, SpeciesSpec>;
export const PLANETS = planetsJson as unknown as Record<string, PlanetSpec>;
export const CONTRACTS = contractsJson as unknown as Record<string, ContractSpec>;

export function getSpecies(id: string): SpeciesSpec {
  const s = SPECIES[id];
  if (!s) throw new Error(`Unknown species: ${id}`);
  return s;
}

export function getPlanet(id: string): PlanetSpec {
  const p = PLANETS[id];
  if (!p) throw new Error(`Unknown planet: ${id}`);
  return p;
}

export function getContract(id: string): ContractSpec {
  const c = CONTRACTS[id];
  if (!c) throw new Error(`Unknown contract: ${id}`);
  return c;
}
