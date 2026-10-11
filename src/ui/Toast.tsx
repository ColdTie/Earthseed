import { useEffect, useState } from 'preact/hooks';
import type { Game } from './store';
import type { LogEntry, SimState } from '../sim/types';
import type { ViewId } from '../render/view';

/** Shows the latest alert and points to the view where the fix lives. */
export function Toast({ game, state, view }: { game: Game; state: SimState; view: ViewId }) {
  const latest = [...state.log].reverse().find((e) => e.kind !== 'info');
  const [dismissed, setDismissed] = useState<LogEntry | null>(null);
  useEffect(() => {
    // A new game or a new entry un-dismisses.
    if (dismissed && latest && dismissed.tick > latest.tick) setDismissed(null);
  }, [latest, dismissed]);
  if (!latest || latest === dismissed || (dismissed && dismissed.tick === latest.tick && dismissed.text === latest.text)) return null;
  if (latest.view === view && latest.kind !== 'done') {
    // You are already where the fix lives. Say it once in the panel instead.
    return null;
  }
  return (
    <div class={'toast ' + latest.kind} role="status">
      <span class={'icon ' + (latest.kind === 'alert' ? 'warn' : 'ok')} aria-hidden="true">{latest.kind === 'alert' ? '!' : '✓'}</span>
      <p>{latest.text}</p>
      {latest.view && latest.view !== view && (
        <button class="btn primary" onClick={() => game.stage.go(latest.view!)}>
          Open {latest.view}
        </button>
      )}
      <button class="btn" onClick={() => setDismissed(latest)} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
