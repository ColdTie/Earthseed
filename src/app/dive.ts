/**
 * The camera dive between views, as plain state with no rendering, so its
 * timing can be tested without a screen.
 *
 * A dive has two halves. In the leave half the old view stays on screen
 * while the fade closes. In the arrive half the new view is on screen while
 * the fade opens. The view on screen only ever changes at the midpoint,
 * behind a closed fade.
 */
import { VIEW_DEPTH, type ViewId } from '../render/view';

export const DIVE_SECONDS = 0.85;
const HALF = DIVE_SECONDS / 2;

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export interface DiveFrame {
  /** The view to draw this frame. */
  shown: ViewId;
  /** How closed the fade is, 0 open to 1 closed. */
  opacity: number;
  leg: 'rest' | 'leave' | 'arrive';
  /** Eased progress through the current leg, 0 to 1. */
  t: number;
  from: ViewId;
  to: ViewId;
  /** True when this leg moves toward a deeper (more zoomed in) view. */
  deeper: boolean;
  /** True on the frame a dive finishes. */
  done: boolean;
}

interface Leg {
  from: ViewId;
  to: ViewId;
  elapsed: number;
  leaveDeeper: boolean;
  arriveDeeper: boolean;
}

function deeper(to: ViewId, from: ViewId): boolean {
  return VIEW_DEPTH[to] < VIEW_DEPTH[from];
}

export class Dive {
  private leg: Leg | null = null;

  constructor(private shownView: ViewId) {}

  /** Where the camera is headed, or where it rests. */
  get target(): ViewId {
    return this.leg ? this.leg.to : this.shownView;
  }

  /** The view on screen right now. */
  get shown(): ViewId {
    return this.shownView;
  }

  get moving(): boolean {
    return this.leg !== null;
  }

  /** Head for a view. Returns false if already headed there. */
  go(id: ViewId): boolean {
    if (id === this.target) return false;
    const leg = this.leg;
    if (leg && leg.elapsed < HALF) {
      // Leave half: the old view is still on screen. Keep moving, change where it lands.
      leg.to = id;
      leg.arriveDeeper = deeper(id, leg.from);
      return true;
    }
    // At rest, or in the arrive half with leg.to on screen. In the arrive half,
    // start leaving from the mirrored point so the fade picks up about where it is.
    const from = this.shownView;
    const d = deeper(id, from);
    this.leg = { from, to: id, elapsed: leg ? Math.max(0, DIVE_SECONDS - leg.elapsed) : 0, leaveDeeper: d, arriveDeeper: d };
    return true;
  }

  /** Advance by dt seconds of wall clock time. */
  advance(dt: number): DiveFrame {
    const leg = this.leg;
    if (!leg) {
      const v = this.shownView;
      return { shown: v, opacity: 0, leg: 'rest', t: 1, from: v, to: v, deeper: false, done: false };
    }
    leg.elapsed += dt;
    const u = Math.min(1, leg.elapsed / DIVE_SECONDS);
    if (u < 0.5) {
      const t = easeInOut(u / 0.5);
      return { shown: leg.from, opacity: Math.min(1, t * 1.15), leg: 'leave', t, from: leg.from, to: leg.to, deeper: leg.leaveDeeper, done: false };
    }
    const t = easeInOut((u - 0.5) / 0.5);
    this.shownView = leg.to;
    const done = u >= 1;
    if (done) this.leg = null;
    return {
      shown: leg.to,
      opacity: done ? 0 : Math.max(0, 1 - t * 1.25),
      leg: 'arrive',
      t,
      from: leg.from,
      to: leg.to,
      deeper: leg.arriveDeeper,
      done,
    };
  }
}
