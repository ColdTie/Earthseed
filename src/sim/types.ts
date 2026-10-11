export type TraitId = 'output' | 'heatTolerance' | 'coldTolerance' | 'signaling' | 'lifespan' | 'speed';

export const TRAIT_IDS: readonly TraitId[] = [
  'output',
  'heatTolerance',
  'coldTolerance',
  'signaling',
  'lifespan',
  'speed',
];

export type ResourceId = 'energy' | 'feed' | 'calcium' | 'ore' | 'silica' | 'geneLibrary';

export const RESOURCE_IDS: readonly ResourceId[] = ['energy', 'feed', 'calcium', 'ore', 'silica', 'geneLibrary'];

export type Traits = Record<TraitId, number>;
export type Resources = Record<ResourceId, number>;

export interface Genome {
  /** Visual seed for the lineage. Same seed and traits give the same creature. */
  seed: number;
  speciesId: string;
  traits: Traits;
}

export interface TraitSpec {
  label: string;
  default: number;
  sigma: number;
  editCost: Partial<Resources>;
}

export interface SpeciesSpec {
  id: string;
  name: string;
  basis: string;
  output: string;
  bodyPlan: 'crawler' | 'mollusk' | 'sessile' | 'mat' | 'flyer' | 'vat';
  inputs: string[];
  weakness: string;
  summary: string;
  look: Record<string, string>;
  traits: Record<TraitId, TraitSpec>;
  editable: TraitId[];
  tensionPairs: [TraitId, TraitId][];
  tensionRatio: number;
  generationTicks: number;
  stabilize: { cost: Partial<Resources>; sigmaFactor: number };
  production: Record<string, number>;
  /** The crew never draws these below this level, so a gene edit can always be afforded. */
  reserve?: Partial<Resources>;
  stress?: { crackThreshold: number };
  workers: number;
}

export interface PlanetSpec {
  id: string;
  name: string;
  type: string;
  role: string;
  position: [number, number, number];
  climate: { heat: number; cold: number; tide: number; light: number };
  pressure: Partial<Traits>;
  palette: Record<string, string>;
  stock?: Partial<Resources>;
  income?: Partial<Resources>;
  locked: boolean;
}

export interface ContractSpec {
  id: string;
  title: string;
  client: string;
  planetId: string;
  speciesId: string;
  request: string;
  conditions: string;
  blueprint: { length: number; height: number; depth: number; material: string };
  workers: number;
  softDeadlineTicks: number;
  rewards: Record<string, number>;
  unlocks: string[];
  status: 'open' | 'locked' | 'active' | 'done';
}

export type Speed = 0 | 1 | 2 | 4;

export interface LogEntry {
  tick: number;
  kind: 'info' | 'alert' | 'done';
  /** Which view the fix lives in, when there is one. */
  view?: 'galaxy' | 'swarm' | 'organism';
  text: string;
}

export interface SimState {
  version: 1;
  seed: number;
  tick: number;
  speed: Speed;
  planetId: string;
  contractId: string;
  speciesId: string;
  generation: number;
  /** Ticks elapsed in the current generation. */
  generationTick: number;
  /** The genes the swarm is running on right now. */
  live: Genome;
  /** The plan for the next generation. Edits land here. */
  draft: Genome;
  /** Resources at the site. Pending edit costs are reserved against these. */
  resources: Resources;
  /** Spend energy each generation to halve drift. Never stops it. */
  stabilize: boolean;
  /** Total calcite the crew has laid so far. */
  calcite: number;
  /** 0 to 1. How much of the crew's work the heat is costing. */
  heatStress: number;
  /** Last generation's drift per trait, so the UI can show what moved. */
  lastDrift: Traits;
  log: LogEntry[];
  rngState: number;
}

export type Action =
  | { type: 'setTrait'; trait: TraitId; value: number }
  | { type: 'setSpeed'; speed: Speed }
  | { type: 'setStabilize'; on: boolean }
  | { type: 'resetDraft' };
