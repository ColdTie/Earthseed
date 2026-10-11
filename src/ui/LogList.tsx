import type { Game } from './store';
import type { SimState } from '../sim/types';

export function LogList({ game, state, limit }: { game: Game; state: SimState; limit: number }) {
  const entries = state.log.slice(-limit).reverse();
  return (
    <ul class="log">
      {entries.map((e, i) => (
        <li key={`${e.tick}-${i}`}>
          <span class={'icon ' + (e.kind === 'alert' ? 'warn' : e.kind === 'done' ? 'ok' : 'info')} aria-hidden="true">
            {e.kind === 'alert' ? '!' : e.kind === 'done' ? '✓' : 'i'}
          </span>
          <span>{e.text}</span>
          {e.view && e.view !== game.stage.current && (
            <button class="btn" onClick={() => game.stage.go(e.view!)}>
              {e.view}
            </button>
          )}
        </li>
      ))}
      {entries.length === 0 && <li>Nothing yet.</li>}
    </ul>
  );
}
