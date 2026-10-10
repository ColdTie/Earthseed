/**
 * Body plan: turns a genome into the numbers that place every part.
 * Pure math, no Three.js, so it can be tested in Node.
 *
 * Traits must be visible. Each line here is a trait doing something you
 * can see on the creature.
 */
import { getSpecies } from '../sim/data';
import { Rng, seedFrom } from '../sim/rng';
import type { Genome } from '../sim/types';

export const PART = {
  HEAD: 1,
  THORAX: 2,
  BELLY: 3,
  SHELL: 4,
} as const;

export interface LegPlan {
  /** Hip position in body space. */
  hip: [number, number, number];
  /** Rest foot position in body space. */
  foot: [number, number, number];
  femur: number;
  tibia: number;
  radius: number;
  /** Gait phase, 0 or 0.5 for a tripod gait. */
  phase: number;
}

export interface CrawlerPlan {
  seed: number;
  /** Overall size multiplier. Lifespan makes a bigger, slower body. */
  size: number;
  /** Width multiplier. Speed makes a slimmer body. */
  slim: number;
  /** 0 to 1. Heat tolerance thickens and darkens the shell. */
  shellThick: number;
  /** Number of ridges on the shell. */
  ridges: number;
  /** 0 to 1. Cold tolerance rounds the body and adds a fuzzy coat. */
  fuzz: number;
  /** Radius of the calcite gland. Output makes it bigger and brighter. */
  glandRadius: number;
  glandGlow: number;
  /** Antenna length and pulse rate. Signaling makes them longer and brighter. */
  antennaLength: number;
  antennaSegments: number;
  pulseRate: number;
  /** Steps per second while walking. */
  gaitRate: number;
  /** Variation picked from the seed so a lineage looks its own. */
  hueShift: number;
  legs: LegPlan[];
  /** Body primitive placement. */
  head: { c: [number, number, number]; r: [number, number, number] };
  thorax: { c: [number, number, number]; r: [number, number, number] };
  belly: { c: [number, number, number]; r: [number, number, number] };
  shell: { c: [number, number, number]; r: [number, number, number]; clipY: number; ridgeAmp: number };
  gland: [number, number, number];
  eyes: [[number, number, number], [number, number, number]];
  eyeRadius: number;
  mandible: { base: [number, number, number]; length: number; radius: number };
  antennaBase: [[number, number, number], [number, number, number]];
  colors: { shell: string; body: string; belly: string; limb: string; gland: string; glandGlow: string; antenna: string; antennaGlow: string; eye: string; shellHot: string };
}

function n(v: number): number {
  return Math.min(1, Math.max(0, v / 100));
}

export function crawlerPlan(genome: Genome): CrawlerPlan {
  const species = getSpecies(genome.speciesId);
  const t = genome.traits;
  const rng = new Rng(seedFrom(genome.seed, 'plan'));

  const size = 0.85 + 0.4 * n(t.lifespan);
  const slim = 1.08 - 0.22 * n(t.speed);
  const shellThick = n(t.heatTolerance);
  const fuzz = n(t.coldTolerance);
  const round = 1 + 0.12 * fuzz;
  const legLen = (0.55 + 0.5 * n(t.speed)) * size;
  const legRadius = 0.035 * size * (1 + 0.3 * (1 - n(t.speed)));
  const hueShift = rng.range(-0.03, 0.03);
  const legSpread = rng.range(0.95, 1.05);

  const legs: LegPlan[] = [];
  const hipsX = [0.5, 0.15, -0.28];
  const hipsZ = [0.3, 0.36, 0.34];
  const footX = [0.78, 0.1, -0.62];
  for (let i = 0; i < 3; i++) {
    for (const side of [1, -1] as const) {
      const hx = hipsX[i]! * size;
      const hz = hipsZ[i]! * side * size * slim;
      const fx = footX[i]! * size * legSpread;
      const fz = side * (0.45 + legLen * 0.75) * legSpread;
      legs.push({
        hip: [hx, -0.02 * size, hz],
        foot: [fx, -0.42 * size, fz],
        femur: legLen * 0.62,
        tibia: legLen * 0.78,
        radius: legRadius,
        phase: (i + (side === 1 ? 0 : 1)) % 2 === 0 ? 0 : 0.5,
      });
    }
  }

  const s = size;
  const w = slim * round;
  const plan: CrawlerPlan = {
    seed: genome.seed,
    size,
    slim,
    shellThick,
    ridges: Math.round(2 + 6 * shellThick),
    fuzz,
    glandRadius: (0.09 + 0.16 * n(t.output)) * s,
    glandGlow: 0.25 + 1.2 * n(t.output),
    antennaLength: (0.45 + 0.9 * n(t.signaling)) * s,
    antennaSegments: 3,
    pulseRate: 0.4 + 2.6 * n(t.signaling),
    gaitRate: 0.6 + 1.6 * n(t.speed) - 0.3 * n(t.lifespan),
    hueShift,
    legs,
    head: { c: [0.8 * s, 0.03 * s, 0], r: [0.27 * s, 0.22 * s * round, 0.28 * s * w] },
    thorax: { c: [0.4 * s, 0.1 * s, 0], r: [0.3 * s, 0.25 * s * round, 0.36 * s * w] },
    belly: { c: [-0.3 * s, 0.02 * s, 0], r: [0.74 * s, 0.26 * s * round, 0.44 * s * w] },
    shell: {
      c: [-0.3 * s, (0.1 + 0.08 * shellThick) * s, 0],
      r: [0.78 * s, (0.26 + 0.14 * shellThick) * s * round, (0.47 + 0.05 * shellThick) * s * w],
      clipY: 0.02 * s,
      ridgeAmp: 0.028 * shellThick * s,
    },
    gland: [-1.02 * s, -0.02 * s, 0],
    eyes: [
      [1.0 * s, 0.1 * s, 0.16 * s * w],
      [1.0 * s, 0.1 * s, -0.16 * s * w],
    ],
    eyeRadius: 0.045 * s,
    mandible: { base: [1.02 * s, -0.06 * s, 0], length: 0.2 * s, radius: 0.035 * s },
    antennaBase: [
      [0.98 * s, 0.17 * s, 0.1 * s * w],
      [0.98 * s, 0.17 * s, -0.1 * s * w],
    ],
    colors: {
      shell: species.look.shell ?? '#f3ecdd',
      shellHot: species.look.shellHot ?? '#8c6b4a',
      body: species.look.body ?? '#d9c7a6',
      belly: species.look.belly ?? '#fbf6ea',
      limb: species.look.limb ?? '#6b5137',
      gland: species.look.gland ?? '#ffb14a',
      glandGlow: species.look.glandGlow ?? '#ffd27a',
      antenna: species.look.antenna ?? '#5a4634',
      antennaGlow: species.look.antennaGlow ?? '#7ef0ff',
      eye: species.look.eye ?? '#2a1f16',
    },
  };
  return plan;
}

/** Mesh bounds for the body, with a margin so nothing is cut off. */
export function crawlerBounds(plan: CrawlerPlan): { min: [number, number, number]; max: [number, number, number] } {
  const s = plan.size;
  return {
    min: [-1.2 * s, -0.4 * s, -0.65 * s],
    max: [1.2 * s, 0.7 * s, 0.65 * s],
  };
}
