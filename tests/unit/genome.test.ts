import { describe, expect, it } from 'vitest';
import { canAfford, createGenome, editCost, setTrait, tensionPartner } from '../../src/sim/genome';
import { getSpecies } from '../../src/sim/data';
import { resourcesFrom } from '../../src/sim/economy';

const species = getSpecies('masonBeetle');

describe('genome', () => {
  it('starts from species defaults', () => {
    const g = createGenome('masonBeetle', 1);
    expect(g.traits.output).toBe(50);
    expect(g.traits.heatTolerance).toBe(35);
  });

  it('tension pairs pull against each other', () => {
    const g = createGenome('masonBeetle', 1);
    const partner = tensionPartner(species, 'heatTolerance');
    expect(partner).toBe('speed');
    const before = g.traits.speed;
    setTrait(g, 'heatTolerance', 55);
    expect(g.traits.heatTolerance).toBe(55);
    expect(g.traits.speed).toBe(before - 10);
    setTrait(g, 'heatTolerance', 35);
    expect(g.traits.speed).toBe(before);
  });

  it('clamps to 0..100', () => {
    const g = createGenome('masonBeetle', 1);
    setTrait(g, 'output', 500);
    expect(g.traits.output).toBe(100);
    setTrait(g, 'output', -5);
    expect(g.traits.output).toBe(0);
  });

  it('edits cost resources per point moved', () => {
    const live = createGenome('masonBeetle', 1);
    const draft = createGenome('masonBeetle', 1);
    expect(editCost(species, live, draft)).toEqual({});
    setTrait(draft, 'heatTolerance', 45);
    const cost = editCost(species, live, draft);
    // 10 points of heat tolerance at 0.8 calcium, plus 5 points of speed at 0.5 feed.
    expect(cost.calcium).toBe(8);
    expect(cost.feed).toBe(2.5);
    expect(canAfford(resourcesFrom({ calcium: 8, feed: 2.5 }), cost)).toBe(true);
    expect(canAfford(resourcesFrom({ calcium: 7, feed: 2.5 }), cost)).toBe(false);
  });
});
