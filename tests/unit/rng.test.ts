import { describe, expect, it } from 'vitest';
import { Rng, hashString, seedFrom } from '../../src/sim/rng';

describe('Rng', () => {
  it('is deterministic for the same seed', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 1000; i++) expect(a.next()).toBe(b.next());
  });

  it('differs for different seeds', () => {
    const a = new Rng(1);
    const b = new Rng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it('stays in [0, 1) and has a sane mean', () => {
    const r = new Rng(7);
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      sum += v;
    }
    expect(sum / 10000).toBeCloseTo(0.5, 1);
  });

  it('gaussian has roughly the right spread', () => {
    const r = new Rng(99);
    const n = 20000;
    let sum = 0;
    let sq = 0;
    for (let i = 0; i < n; i++) {
      const v = r.gaussian(2.5);
      sum += v;
      sq += v * v;
    }
    const mean = sum / n;
    const sd = Math.sqrt(sq / n - mean * mean);
    expect(Math.abs(mean)).toBeLessThan(0.1);
    expect(sd).toBeCloseTo(2.5, 0);
  });

  it('round trips its state', () => {
    const a = new Rng(5);
    a.next();
    a.next();
    const saved = a.state;
    const b = new Rng(0);
    b.state = saved;
    expect(a.next()).toBe(b.next());
  });

  it('hashes strings stably', () => {
    expect(hashString('beetle')).toBe(hashString('beetle'));
    expect(hashString('beetle')).not.toBe(hashString('beetles'));
    expect(seedFrom(1, 'a')).not.toBe(seedFrom(2, 'a'));
  });
});
