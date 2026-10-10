import { useEffect, useState } from 'preact/hooks';
import type { Game } from './store';
import { useSimState, useView } from './store';
import { TopBar } from './TopBar';
import { GeneEditor } from './GeneEditor';
import { ContractBoard } from './ContractBoard';
import { SitePanel } from './SitePanel';
import { Toast } from './Toast';

export function App({ game }: { game: Game }) {
  const state = useSimState(game.client);
  const view = useView(game.stage);
  const [fps, setFps] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFps(game.stage.renderer.stats.fps), 1000);
    return () => clearInterval(id);
  }, [game]);

  return (
    <>
      <TopBar game={game} state={state} view={view} />
      {state && view === 'organism' && <GeneEditor game={game} state={state} />}
      {state && view === 'galaxy' && <ContractBoard game={game} state={state} />}
      {state && view === 'swarm' && <SitePanel game={game} state={state} />}
      {state && <Toast game={game} state={state} view={view} />}
      {state && (
        <div class="status" aria-live="off">
          gen {state.generation} · tick {state.tick} · {fps} fps
        </div>
      )}
    </>
  );
}
