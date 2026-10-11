import { useEffect, useState } from 'preact/hooks';
import type { GameClient } from '../app/client';
import type { Stage } from '../app/stage';
import type { SimState } from '../sim/types';
import type { ViewId } from '../render/view';

export interface Game {
  client: GameClient;
  stage: Stage;
}

/** The latest simulation snapshot, re-rendering at most a few times a second. */
export function useSimState(client: GameClient, hz = 6): SimState | null {
  const [state, setState] = useState<SimState | null>(client.state);
  useEffect(() => {
    let last = 0;
    let latest: SimState | null = client.state;
    let raf = 0;
    const off = client.subscribe((s) => {
      latest = s;
      const now = performance.now();
      if (now - last > 1000 / hz) {
        last = now;
        setState(s);
      } else if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          last = performance.now();
          setState(latest);
        });
      }
    });
    return () => {
      off();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [client, hz]);
  return state;
}

export function useView(stage: Stage): ViewId {
  const [view, setView] = useState<ViewId>(stage.current);
  useEffect(() => stage.onViewChange(setView), [stage]);
  return view;
}
