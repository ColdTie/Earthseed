/**
 * Seeded random generator. Every random value in sim/ and gen/ comes from
 * here so the same seed always gives the same game and the same creature.
 *
 * mulberry32: tiny, fast, good enough for games. State is a single uint32,
 * so it serializes into save files as one number.
 */
export class Rng {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  /** Current state, for saves. */
  get state(): number {
    return this.s;
  }

  set state(v: number) {
    this.s = v >>> 0;
  }

  /** Uniform in [0, 1). */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Uniform in [min, max). */
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  /** Integer in [0, n). */
  int(n: number): number {
    return Math.floor(this.next() * n);
  }

  /** Pick one item. */
  pick<T>(items: readonly T[]): T {
    const item = items[this.int(items.length)];
    if (item === undefined) throw new Error('pick from empty list');
    return item;
  }

  /** Normal distribution, mean 0, standard deviation sigma (Box-Muller). */
  gaussian(sigma = 1): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sigma;
  }

  /** A child generator whose stream depends on this seed and a label. */
  fork(label: string): Rng {
    return new Rng(hashString(label, this.next() * 4294967296));
  }
}

/** FNV-1a style string hash mixed with an optional numeric salt. */
export function hashString(text: string, salt = 0): number {
  let h = 2166136261 ^ (salt >>> 0);
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return h >>> 0;
}

/** Deterministic seed from any number and label. */
export function seedFrom(seed: number, label: string): number {
  return hashString(label, seed);
}
