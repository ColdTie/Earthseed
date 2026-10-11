import { describe, expect, it } from 'vitest';
import { DIVE_SECONDS, Dive, type DiveFrame } from '../../src/app/dive';
import type { ViewId } from '../../src/render/view';

const VIEWS: ViewId[] = ['galaxy', 'swarm', 'organism'];
const DT = 1 / 120;

/** Play a list of [time, view] presses and return every frame. */
function play(start: ViewId, presses: [number, ViewId][], seconds = 3): { dive: Dive; frames: DiveFrame[] } {
  const dive = new Dive(start);
  const frames: DiveFrame[] = [];
  let next = 0;
  for (let time = 0; time < seconds; time += DT) {
    while (next < presses.length && presses[next]![0] <= time + 1e-9) dive.go(presses[next++]![1]);
    frames.push(dive.advance(DT));
  }
  return { dive, frames };
}

/** The two properties a player sees: no hard cut, and no jump in the fade. */
function problems(frames: DiveFrame[]): string[] {
  const out: string[] = [];
  for (let k = 1; k < frames.length; k++) {
    const a = frames[k - 1]!;
    const b = frames[k]!;
    if (a.shown !== b.shown && (a.opacity < 0.85 || b.opacity < 0.85)) {
      out.push(`frame ${k}: cut ${a.shown} to ${b.shown} at opacity ${a.opacity.toFixed(2)} then ${b.opacity.toFixed(2)}`);
    }
    if (Math.abs(b.opacity - a.opacity) > 0.3) out.push(`frame ${k}: fade jumped ${a.opacity.toFixed(2)} to ${b.opacity.toFixed(2)}`);
  }
  return out;
}

describe('camera dive', () => {
  it('a single dive finishes on time and lands on the target', () => {
    const { dive, frames } = play('organism', [[0, 'galaxy']]);
    const doneAt = frames.findIndex((f) => f.done);
    expect(doneAt * DT).toBeLessThanOrEqual(DIVE_SECONDS + DT);
    expect(dive.shown).toBe('galaxy');
    expect(dive.moving).toBe(false);
    expect(problems(frames)).toEqual([]);
  });

  it('never cuts or jumps, for any timing of two or three quick presses', () => {
    let runs = 0;
    for (const v1 of VIEWS.filter((v) => v !== 'organism')) {
      for (const v2 of VIEWS) {
        for (let t2 = 0; t2 <= 1.0; t2 += 0.025) {
          for (const v3 of VIEWS) {
            for (let gap = 0.05; gap <= 0.6; gap += 0.05) {
              const presses: [number, ViewId][] = [
                [0, v1],
                [t2, v2],
                [t2 + gap, v3],
              ];
              const { dive, frames } = play('organism', presses);
              runs++;
              const found = problems(frames);
              if (found.length > 0) throw new Error(`${JSON.stringify(presses)}: ${found[0]}`);
              // It always comes to rest on the last view pressed.
              expect(dive.moving).toBe(false);
              expect(dive.shown).toBe(v3);
            }
          }
        }
      }
    }
    expect(runs).toBeGreaterThan(5000);
  });

  it('a dive pointed back at its start, then away again, does not cut (found in review)', () => {
    const { dive, frames } = play('organism', [
      [0, 'swarm'],
      [0.2, 'organism'],
      [0.6, 'swarm'],
    ]);
    expect(problems(frames)).toEqual([]);
    expect(dive.shown).toBe('swarm');
  });

  it('a retargeted dive arrives from the side that matches its new direction', () => {
    // swarm to galaxy goes out; retargeting to organism mid-leave goes in.
    const { frames } = play('swarm', [
      [0, 'galaxy'],
      [0.1, 'organism'],
    ]);
    const arrive = frames.find((f) => f.leg === 'arrive')!;
    expect(arrive.to).toBe('organism');
    expect(arrive.deeper).toBe(true);
  });
});
