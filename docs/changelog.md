# Changelog

Newest first. Each entry has the link, the screenshots, and a few things for Steve to try.

## 2026-10-10 · Session 1: the mason beetle in the organism view

**Link:** https://coldtie.github.io/Earthseed/

The link goes live once this branch is merged to `main`. The deploy workflow asks GitHub to switch on Pages the first time it runs. If the first deploy fails with a Pages error, Pages needs to be switched on once in the repository settings with the source set to GitHub Actions. After that every merge deploys on its own.

**What was built**

- The old repository contents were removed. Seedlings starts fresh.
- Build pipeline: TypeScript, Vite, Three.js, Preact, Vitest, Playwright, all pinned. GitHub Actions runs the checks on every pull request and deploys `main` to GitHub Pages.
- Simulation in a Web Worker, fully separate from the screen. Seeded random generator, genome with six traits, tension pairs, edit costs, generations every two minutes at 1x, mutation drift with planet pressure, heat stress, a small economy, browser saves. Same seed gives the same game, checked by tests in Node and in the browser.
- The mason beetle, built in code from its genome. Soft body meshed from blended shapes, legs that bend at the knee, antennae on springs with glowing tips, an amber calcite gland that pulses. Every slider changes the creature right away: heat tolerance thickens, darkens, and ridges the shell; output grows the gland; signaling lengthens the antennae; lifespan makes a bigger, slower body.
- Organism view: specimen dish, slow turntable, soft studio light, toon shading with a rim light. Gene editor with the four sliders, a dark tick for the live value, drift readouts, pending cost, undo, and a steady drift toggle.
- Galaxy view: star map with Seedhome, Hollow Reach, Kessra, and a locked Vel Tor, one route with a ship on it, and the contract board.
- Swarm view: a first diorama of the Kessra shore with the sea, the wall outline, and a feed station. The crew is not there yet. That is the next task.
- The camera dives between views. Keys 1, 2, 3 and the mouse wheel. Alerts point to the view where the fix lives.

**Screenshots**

- Organism view: `docs/screenshots/organism.png`
- After raising heat tolerance and output: `docs/screenshots/organism-edited.png`
- Swarm site: `docs/screenshots/swarm.png`
- Galaxy map: `docs/screenshots/galaxy.png`
- Generation 2 with drift: `docs/screenshots/sequence-1.png` to `sequence-3.png`

**Checks**

- 22 unit tests pass. 5 browser scenarios pass with zero console errors.
- Build is 165 KB compressed, well under the 5 MB budget.
- Draw calls per frame, including the bloom passes: organism view 49, swarm 22, galaxy 26. The budget is 150.
- View dives finish in 0.85 seconds.

**Things to try, Steve**

1. Open the link and watch the beetle for a minute. Does it feel alive? Does anything look off?
2. Drag Heat tolerance up to 70. Watch the shell change. Notice the calcium cost and that Speed drops with it.
3. Wait for the next generation to hatch (about two minutes at 1x, or press 4×). Look at the drift numbers under each slider. Did the beetle change in a way you can see?
4. Press 3, then 2, then 1. Do the camera dives feel right, or too slow, too fast?
5. Try the mouse wheel to move between views.

**Not done yet**

The swarm of 100 beetles building the wall is the next session. Until then the swarm view is a set, not a show. Seed ships do not move cargo yet. No sound.
