import { describe, expect, it } from 'vitest';
import { createGenome, setTrait } from '../../src/sim/genome';
import { applyAction, createSim, pendingCost, stepMany } from '../../src/sim/sim';
import { produce } from '../../src/sim/economy';
import { getPlanet, getSpecies } from '../../src/sim/data';

describe('tension pairs hold however the slider moves', () => {
  it('one step at a time gives the same draft as one jump', () => {
    const jump = createGenome('masonBeetle', 1);
    setTrait(jump, 'heatTolerance', 60);
    const steps = createGenome('masonBeetle', 1);
    for (let v = 36; v <= 60; v++) setTrait(steps, 'heatTolerance', v);
    expect(steps.traits).toEqual(jump.traits);
    expect(steps.traits.speed).toBe(37.5);
  });

  it('stepping down then up returns exactly to the start', () => {
    const g = createGenome('masonBeetle', 1);
    const start = { ...g.traits };
    for (let v = 49; v >= 30; v--) setTrait(g, 'output', v);
    for (let v = 31; v <= 50; v++) setTrait(g, 'output', v);
    expect(g.traits).toEqual(start);
  });

  it('a round trip through the slider ends gains no free points', () => {
    const g = createGenome('masonBeetle', 1);
    const start = { ...g.traits };
    setTrait(g, 'output', 0);
    setTrait(g, 'lifespan', 100);
    setTrait(g, 'output', 50);
    setTrait(g, 'lifespan', 50);
    expect(g.traits).toEqual(start);
  });

  it('a move that would push the partner past its limit stops at the limit', () => {
    const g = createGenome('masonBeetle', 1);
    setTrait(g, 'output', 0); // lifespan 75
    setTrait(g, 'lifespan', 100); // output would be -12.5
    expect(g.traits.output).toBe(0);
    expect(g.traits.lifespan).toBe(75);
  });
});

describe('reserved edit costs', () => {
  it('production does not spend resources an accepted edit has reserved', () => {
    const s = createSim({ seed: 20261010 });
    expect(applyAction(s, { type: 'setTrait', trait: 'heatTolerance', value: 50 })).toBe(true);
    const reserved = pendingCost(s).calcium ?? 0;
    expect(reserved).toBeGreaterThan(0);
    s.resources.calcium = reserved;
    const calcite = s.calcite;
    produce(s, getSpecies(s.speciesId), getPlanet(s.planetId));
    expect(s.calcite).toBe(calcite);
    expect(s.resources.calcium).toBeGreaterThanOrEqual(reserved);
  });

  it('an accepted edit lands even when the crew is short of calcium', () => {
    const s = createSim({ seed: 20261010 });
    applyAction(s, { type: 'setTrait', trait: 'heatTolerance', value: 50 });
    s.resources.calcium = (pendingCost(s).calcium ?? 0) + 1;
    stepMany(s, getSpecies(s.speciesId).generationTicks);
    expect(s.log.some((e) => e.text.includes('did not land'))).toBe(false);
    expect(s.live.traits.heatTolerance).toBeGreaterThan(44);
  });

  it('the edit cost is paid at the generation turn', () => {
    const a = createSim({ seed: 5 });
    const b = createSim({ seed: 5 });
    applyAction(a, { type: 'setTrait', trait: 'heatTolerance', value: 60 });
    const ticks = getSpecies(a.speciesId).generationTicks;
    stepMany(a, ticks);
    stepMany(b, ticks);
    expect(b.resources.calcium - a.resources.calcium).toBeCloseTo(20, 0);
  });
});

describe('Kessra economy', () => {
  it('calcium lasts a whole session with default genes', () => {
    const s = createSim({ seed: 20261010 });
    stepMany(s, 18000); // 30 minutes at 1x
    expect(s.resources.calcium).toBeGreaterThan(50);
    expect(applyAction(s, { type: 'setTrait', trait: 'heatTolerance', value: s.live.traits.heatTolerance + 10 })).toBe(true);
  });

  it('calcium lasts at least the 15 to 25 minute wall with heat tolerance at 60', () => {
    const s = createSim({ seed: 20261010 });
    applyAction(s, { type: 'setTrait', trait: 'heatTolerance', value: 60 });
    stepMany(s, 15000); // 25 minutes at 1x
    expect(s.resources.calcium).toBeGreaterThan(0);
  });
});

describe('the crew leaves a reserve (found in the second review)', () => {
  it('after maxed output drains calcium, a correction is affordable again within a generation', () => {
    const s = createSim({ seed: 20261010 });
    applyAction(s, { type: 'setTrait', trait: 'output', value: 100 });
    applyAction(s, { type: 'setTrait', trait: 'heatTolerance', value: 60 });
    stepMany(s, 20000);
    const species = getSpecies(s.speciesId);
    const reserve = species.reserve?.calcium ?? 0;
    expect(s.resources.calcium).toBeGreaterThanOrEqual(reserve);
    expect(s.resources.calcium).toBeLessThan(reserve + 5);
    // Lowering output by 20 costs 10 calcium, inside the reserve.
    expect(applyAction(s, { type: 'setTrait', trait: 'output', value: Math.round(s.live.traits.output) - 20 })).toBe(true);
    stepMany(s, species.generationTicks);
    expect(s.log.some((e) => e.text.includes('did not land'))).toBe(false);
  });

  it('a hungry crew stalls, then eats again as feed comes in', () => {
    const s = createSim({ seed: 3 });
    const species = getSpecies(s.speciesId);
    s.resources.feed = 1; // below the reserve
    const calcite = s.calcite;
    produce(s, species, getPlanet(s.planetId));
    expect(s.calcite).toBe(calcite);
    stepMany(s, 2000);
    expect(s.resources.feed).toBeGreaterThanOrEqual(species.reserve?.feed ?? 0);
    expect(s.calcite).toBeGreaterThan(calcite);
  });
});
