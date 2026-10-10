import { describe, expect, it } from 'vitest';
import { applyAction, createSim, pendingCost, serialize, step, stepMany } from '../../src/sim/sim';
import { getSpecies } from '../../src/sim/data';
import { heatStress } from '../../src/sim/economy';
import { getPlanet } from '../../src/sim/data';

describe('sim', () => {
  it('same seed gives an identical state after 3000 ticks', () => {
    const a = createSim({ seed: 1234 });
    const b = createSim({ seed: 1234 });
    applyAction(a, { type: 'setTrait', trait: 'heatTolerance', value: 60 });
    applyAction(b, { type: 'setTrait', trait: 'heatTolerance', value: 60 });
    stepMany(a, 3000);
    stepMany(b, 3000);
    expect(serialize(a)).toBe(serialize(b));
    expect(a.generation).toBe(3);
  });

  it('different seeds drift differently', () => {
    const a = createSim({ seed: 1 });
    const b = createSim({ seed: 2 });
    stepMany(a, 1200);
    stepMany(b, 1200);
    expect(JSON.stringify(a.live.traits)).not.toBe(JSON.stringify(b.live.traits));
  });

  it('edits land on the next generation and are paid for then', () => {
    const s = createSim({ seed: 5 });
    const species = getSpecies(s.speciesId);
    const calciumBefore = s.resources.calcium;
    expect(applyAction(s, { type: 'setTrait', trait: 'heatTolerance', value: 60 })).toBe(true);
    expect(s.draft.traits.heatTolerance).toBe(60);
    expect(s.live.traits.heatTolerance).toBe(35);
    expect(pendingCost(s).calcium).toBe(20);
    stepMany(s, species.generationTicks - 1);
    expect(s.generation).toBe(1);
    step(s);
    expect(s.generation).toBe(2);
    // Landed, then drifted a little around 60.
    expect(Math.abs(s.live.traits.heatTolerance - 60)).toBeLessThan(12);
    expect(s.resources.calcium).toBeLessThan(calciumBefore - 19);
  });

  it('refuses edits it cannot pay for', () => {
    const s = createSim({ seed: 5 });
    s.resources.calcium = 1;
    expect(applyAction(s, { type: 'setTrait', trait: 'heatTolerance', value: 90 })).toBe(false);
    expect(s.draft.traits.heatTolerance).toBe(35);
  });

  it('heat stress crosses the crack threshold at the documented tolerance', () => {
    const planet = getPlanet('kessra');
    const species = getSpecies('masonBeetle');
    const threshold = species.stress!.crackThreshold;
    const low = { ...createSim({ seed: 1 }).live.traits, heatTolerance: 35 };
    const ok = { ...low, heatTolerance: 60 };
    expect(heatStress(low, planet)).toBeGreaterThanOrEqual(threshold);
    expect(heatStress(ok, planet)).toBeLessThan(threshold);
  });

  it('stabilizing halves drift on average', () => {
    let free = 0;
    let steady = 0;
    const runs = 30;
    for (let i = 0; i < runs; i++) {
      const a = createSim({ seed: 100 + i });
      const b = createSim({ seed: 100 + i });
      b.resources.energy = 100000;
      applyAction(b, { type: 'setStabilize', on: true });
      stepMany(a, 1200);
      stepMany(b, 1200);
      free += Math.abs(a.lastDrift.output);
      steady += Math.abs(b.lastDrift.output);
    }
    expect(steady).toBeLessThan(free);
  });

  it('keeps going after a generation with no money', () => {
    const s = createSim({ seed: 9 });
    applyAction(s, { type: 'setTrait', trait: 'heatTolerance', value: 60 });
    s.resources.calcium = 0;
    stepMany(s, 1200);
    expect(s.generation).toBe(2);
    expect(s.log.some((e) => e.text.includes('did not land'))).toBe(true);
  });
});
