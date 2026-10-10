# Seedlings: rules for Claude Code

Read this first, every session. The full brief lives at `docs/brief.md` and is the source of truth. This file is the short version you must follow.

## What this is

Seedlings is a stylized 3D simulation game that runs in the browser. The player is a Seedling engineer who grows everything from engineered life: design organisms, watch swarms of them build, run a network of colonies and client worlds. No combat. Pressure comes from harsh planets, scarce resources, organisms that mutate on their own, and the monsters humanity left behind.

Steve does not install or open any development software. Claude Code does all building, testing, and deploying. Steve plays the game from a link and gives feedback in plain language.

## Rules

1. Never ask Steve to install, run, open, or edit anything. He only plays the live link and gives feedback.
2. Write everything addressed to Steve in short, plain language. No jargon.
3. One focused task per session. Small commits with clear messages.
4. Keep `main` deployable at all times. Merge only when tests pass and screenshots look right.
5. Always look at the screenshots before calling a task done. If it looks ugly or unclear, it is not done.
6. Every random value in `src/sim/` and `src/gen/` comes from the seeded generator. Same seed, same game.
7. Every new species needs a `basis` field in `data/species.json` naming the real organism or process it comes from.
8. No combat, ever. Pressure comes from environment, scarcity, time, and containment.
9. All names and text are original. Earthseed is inspiration, not content.
10. Pin every dependency to an exact version. Never adopt a release published in the last 14 days.
11. When something in the brief is unclear, pick the simplest reasonable option, note it in `docs/questions.md`, and keep going.
12. Stay inside the performance budget. Measure, don't guess. 60 fps with 200 workers on a typical laptop, under 150 draw calls per frame, under 5 MB initial download.

## Architecture rules

- `src/sim/` never imports Three.js, Preact, or the DOM. It takes a seed and inputs and returns state.
- `src/render/` reads simulation snapshots and never changes game state.
- All tunable numbers live in `data/`, not in code.
- `window.__seedlings` is the debug hook. Tests use it to jump to a view, fast forward ticks, set a seed, and read state.

## Every work session

1. Pick the top task from `docs/roadmap.md`, or turn new feedback in `docs/feedback.md` into tasks first.
2. Work on a branch. Write the code and unit tests.
3. Build, then run Playwright in headless Chromium with software WebGL. Load a fixed seed scenario and capture screenshots of all three views plus a short sequence of the swarm building.
4. Look at the screenshots. Check them against the art direction and the success criteria. Fix anything that looks wrong, broken, or ugly before moving on.
5. Compare against the previous screenshots and note anything that changed unexpectedly.
6. Merge to main only when tests pass and the screenshots look right. GitHub Actions deploys to GitHub Pages.
7. Append to `docs/changelog.md`: the link, the new screenshots, and three to five specific things for Steve to try.

## Commands

```
npm ci            install pinned dependencies
npm run typecheck strict TypeScript check
npm test          unit tests (Vitest, Node, no browser)
npm run build     typecheck plus production build to dist/
npm run e2e       Playwright scenarios, writes docs/screenshots/
npm run check     typecheck, unit tests, build
```

Playwright uses the Chromium that ships with the pinned `@playwright/test`. In this cloud environment it is preinstalled at `PLAYWRIGHT_BROWSERS_PATH`. In CI the workflow installs it.

## Where things stand

See `docs/changelog.md` for the latest state and `docs/roadmap.md` for what is next.
