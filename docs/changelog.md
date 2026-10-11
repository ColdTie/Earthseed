# Changelog

Newest first. Each entry has the link, the screenshots, and a few things for Steve to try.

## 2026-10-10 · Session 1: the mason beetle in the organism view

**Link:** https://coldtie.github.io/Earthseed/

The game goes live at that link after one setting changes on GitHub. Pages is on, but in an older mode that copies files straight from the branch. The game has to be built before it can run, so Pages must be told to publish from GitHub Actions instead. Steps: open https://github.com/ColdTie/Earthseed/settings/pages, and under "Build and deployment", set Source to "GitHub Actions". After that, every merge publishes the game on its own.

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
- A refused edit explaining itself: `docs/screenshots/organism-refused.png`

**Checks**

- 37 unit tests pass, including a sweep of more than 5,000 view switch timings. 8 browser scenarios pass with zero console errors.
- Build is 165 KB compressed, well under the 5 MB budget.
- Draw calls per frame, including the bloom passes: organism view 49, swarm 22, galaxy 26. The budget is 150.
- View dives finish in 0.85 seconds.

**Things to try, Steve**

1. Open the link and watch the beetle for a minute. Does it feel alive? Does anything look off?
2. Drag Heat tolerance up to 70. Watch the shell change. Notice the calcium cost and that Speed drops with it.
3. Wait for the next generation to hatch (about two minutes at 1x, or press 4×). Look at the drift numbers under each slider. Did the beetle change in a way you can see?
4. Press 3, then 2, then 1. Do the camera dives feel right, or too slow, too fast?
5. Try the mouse wheel to move between views.

**Also in this session**

- A loading screen shows while the game starts.
- The browser tests now run against the same web address GitHub Pages uses, and reach their test server on GitHub's machines. Both had broken the first CI run.

**Fixed before going live, after an independent code review**

- Dragging a slider slowly, or with the arrow keys, skipped the trade-off. Speed now drops with heat tolerance however the slider moves.
- Calcium ran out in about 10 minutes and feed in about 29, after which no gene edit was possible. Kessra now has a small supply of both until seed ships exist.
- An edit the game had accepted could be dropped when the generation turned. Reserved resources are now held back from the crew.
- Dragging a slider stuttered, because the beetle was rebuilt in full on every step. It now updates at lower detail while dragging and sharpens when you let go.
- A white jagged seam showed where the shell meets the thorax. Gone.
- A refused edit snapped the slider back with no reason given. It now says which resource is short.
- Keys 1, 2, 3 stopped working after touching a slider. Fixed.
- Changing view in the middle of a camera dive cut hard to the wrong scene. The dive now carries on to the new view.
- The haze in the swarm view did not reach the ground or sea, so the horizon showed a hard edge. Fixed.

A second check of those fixes found that a crew pushed to high output could still run calcium to zero and lock every edit. The crew now keeps a small reserve so a correction is always affordable. The same check found quick back-and-forth view switches could still cut. The camera dive was rebuilt and is now tested against thousands of switch timings.

**Not done yet**

The swarm of 100 beetles building the wall is the next session. Until then the swarm view is a set, not a show. Seed ships do not move cargo yet. No sound.
