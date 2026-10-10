import type { Scene, Vector3 } from 'three';
import type { SimState } from '../sim/types';

export type ViewId = 'galaxy' | 'swarm' | 'organism';

/** Deeper views have a lower number, matching the keys 1, 2, 3. */
export const VIEW_DEPTH: Record<ViewId, number> = { organism: 1, swarm: 2, galaxy: 3 };
export const VIEW_ORDER: ViewId[] = ['galaxy', 'swarm', 'organism'];

export interface CameraPose {
  position: Vector3;
  target: Vector3;
}

export interface View {
  readonly id: ViewId;
  readonly scene: Scene;
  /** Where the camera rests. */
  readonly pose: CameraPose;
  /** Close in on the focus. Used when diving deeper. */
  readonly divePose: CameraPose;
  /** Pulled far back. Used when zooming out. */
  readonly farPose: CameraPose;
  /** Background color, also used for the fade between views. */
  readonly background: string;
  /** Bloom strength and threshold that suit this view. */
  readonly bloom: number;
  readonly bloomThreshold: number;
  /** Called with the latest simulation state, every frame. */
  update(dt: number, state: SimState | null): void;
  onEnter?(): void;
  onLeave?(): void;
}
