# Seedlings

A stylized 3D simulation game that runs in the browser. You are a Seedling engineer. Your people left Earth generations ago and grow everything they need from engineered life. Design organisms, watch swarms of them build walls and food and fabric, and run a growing network of colonies and client worlds.

There is no combat. Pressure comes from harsh planets, scarce resources, organisms that mutate on their own, and the monsters humanity left behind.

Play: https://coldtie.github.io/Earthseed/

Keys 1, 2, 3 or the mouse wheel switch between the organism, swarm, and galaxy views.

## How this is built

Claude Code builds, tests, and deploys everything. Steve plays the live link and gives feedback in plain language. The brief is in `docs/brief.md`. The rules Claude follows are in `CLAUDE.md`. Progress is in `docs/changelog.md`. Feedback goes in `docs/feedback.md` and becomes tasks in `docs/roadmap.md`.

## Stack

TypeScript, Vite, Three.js, Preact, Vitest, Playwright. The simulation runs in a Web Worker and never touches the screen, so game logic is tested in Node without a browser. Every creature is generated in code from a genome. There are no art or audio asset files.

## Layout

```
src/sim/      pure game logic: genome, drift, economy, tick loop, worker
src/gen/      procedural organisms: body plans, signed distance meshing, materials, motion
src/render/   Three.js scenes for organism, swarm, galaxy
src/app/      main thread glue: worker client, stage with camera dives
src/ui/       Preact panels: gene editor, contract board, resource bars
src/debug/    window.__seedlings test hook
data/         species.json, planets.json, contracts.json, resources.json
tests/        unit tests and Playwright scenarios
docs/         brief, roadmap, feedback, changelog, questions, screenshots
```
