# Seedlings: Build Brief for Claude Code

Oct 10, 2026 · Steven Penner

This is the source of truth. `CLAUDE.md` at the repo root carries the rules from the end of this document.

## Pitch and pillars

Seedlings is a stylized 3D simulation game that runs in the browser. The player is a Seedling engineer, part of a peaceful sect that left Earth generations ago and now grows everything it needs from engineered life. You design organisms, watch swarms of them build walls, food, and fabric, and run a growing network of colonies and client worlds across the galaxy.

There is no combat. Pressure comes from harsh planets, scarce resources, organisms that mutate on their own, and the monstrous creations humanity left behind.

Design pillars

1. **Three scales, one problem.** Problems appear at one scale and get solved at another. The player constantly zooms between organism, swarm, and galaxy.
2. **Grounded in real biology.** Every organism ability exaggerates a real process: calcite precipitation, biomining, cellulose spinning. A curious player could look it up and find it is real.
3. **Change is the doctrine.** Organisms drift between generations, so the player adapts rather than controls. Earthseed's core belief becomes a mechanic.
4. **Readable, beautiful life.** Function drives appearance. You can tell what a creature does by looking at it. Colorful, stylized, alive.
5. **Nonviolent pressure.** Tension comes from scarcity, environment, time, and containment. Never from killing.

**Target:** plays in any modern desktop browser at 60 fps with no install, deployed to a public link.

## World and lore

The tone is hopeful and full of wonder, with darker edges from what humanity left behind. Think solarpunk on a galactic scale.

**History.** Humanity used AI to master genetics. What it created was both astonishing and monstrous, and the century that followed was full of strife. A small sect inspired by the idea that change is the one constant left Earth to build a society free from interference and violence. They became the Seedlings.

**The Seedlings today.** They have been self sufficient for generations and have spread well beyond their first destination. Their freedom came from one skill: shaping life so it provides for them. Walls, homes, food, meat, clothing, glass, and energy are all grown. Seedlings are peaceful explorers, and they now use their craft to build for struggling species across the galaxy.

**Doctrine.** Change cannot be stopped, only shaped. Seedlings guide their organisms gently and adapt when those organisms change on their own. In game terms this means mutation drift is expected and respected, never a bug to eliminate.

**Humanity's legacy.** Escaped bioweapons, feral engineered species, and invasive organisms drift between star systems. Seedlings never fight them. They contain them, outcompete them with better adapted organisms, or slowly rehabilitate them into useful species.

Starting places

| Name | Type | Role in the first slice |
| --- | --- | --- |
| Seedhome | Seedling home world | Gene library, seed ship origin |
| Hollow Reach | Seedling colony | Secondary supplier of feed and biomass |
| Kessra | Client world, hot and coastal | First contract: a sea wall |
| Vel Tor | Client world, cold and dim | Second contract, locked at start |

**Naming note.** Earthseed belongs to Octavia E. Butler's novels. Treat it as inspiration only. All in game names, factions, and text must be original.

## Core loop and the three views

The player rotates between three views of the same problem. Each view has one job, and the fun comes from fixing at one scale what broke at another.

Every problem appears at one scale and gets solved at another.

- **3 · Galaxy.** Where problems come from. Contracts, harsh planets. Seed ships, resource bars. Threats spread on routes.
- **2 · Swarm.** Where problems show up. Workers follow local rules. Cracks, stalls, hungry crews. You place markers, not orders.
- **1 · Organism.** Where problems get solved. Edit traits, pay the cost. Changes land next generation. Drift keeps shifting them.

Two feedback paths: the next generation builds better (organism to swarm), and edits and shipments spend resources (organism to galaxy).

One full loop on Kessra

1. **Galaxy:** Kessra posts a contract for a sea wall. The planet is hot and coastal.
2. **Swarm:** 100 mason beetles start building. Within a few minutes, cracks spread through the lower rows.
3. **Organism:** the beetle's heat tolerance is too low. Raising it costs calcium and lowers calcite output.
4. **Galaxy:** worker feed is already short, so the player routes a seed ship from Hollow Reach or accepts a slower build.
5. **Swarm:** the next generation lays stronger blocks, but drift has shortened their lifespan. The loop starts again.

**Switching views.** Keys 1, 2, 3 or the mouse wheel. An alert in one view points to the view where the fix lives.

## Organism science catalog

Every species is a game version of a real organism or process. This table is the source of truth for `data/species.json`: inputs, outputs, and visual signature should all follow from it.

| Output | Real biology | Game species | Inputs and weakness | Signature look |
| --- | --- | --- | --- | --- |
| Stone, concrete | Sporosarcina pasteurii precipitates calcite from urea and calcium, used in self healing concrete and grown bricks. Corals build reefs from aragonite. | Mason beetle, reef polyp | Calcium, urea feed. Weak in heat. | Chalky white shell, glowing amber calcite gland, mandibles |
| Wood, beams | Komagataeibacter bacteria spin pure cellulose. MIT grew wood like tissue from plant cells. | Fiber weaver | Sugar. Slow builder. | Tan and moss green, segmented body, spinnerets |
| Metal | Acidithiobacillus leaches iron and copper from ore in real biomining. The scaly foot snail grows iron sulfide armor. Cupriavidus metallidurans precipitates gold. | Ore grinder, iron snail | Raw ore. Produces acidic waste. | Rust red and black, grinding jaws, metallic plated shell |
| Glass | Diatoms and glass sponges build silica skeletons. | Glass sponge | Silica, cool water. Fragile. | Translucent lattice, iridescent sheen |
| Meat | Cultivated meat grows muscle cells on scaffolds. Mycoprotein comes from a fungus. | Flesh vat, fungal mat | Sugar, sterile conditions. | Pink marbled tissue, slow pulse; cream mycelium |
| Fabric | Spider silk proteins are produced in yeast. Mycelium makes leather substitutes. | Silk moth, leather fungus | Leaves or sugar. | Pale shimmering wings; brown fungal sheets |
| Glue, sealant | Mussel foot proteins and barnacle cement set underwater. | Binder snail | Algae feed. Slow. | Deep blue shell, glossy trail |
| Energy, light | Cyanobacteria photosynthesize. Geobacter conducts electricity. Bioluminescence comes from luciferin. | Light algae, battery mat, glow lamp | Light or organic waste. | Blue green ponds; dark mats with sparks; soft cyan glow |

First slice uses only the mason beetle, light algae, and feed. Everything else is data for later milestones.

## Procedural organisms

No creature is modeled by hand. Every organism is built in code from a genome, so the same genome always produces the same creature and every edit visibly changes it.

Pipeline

1. **Genome.** A seed plus numeric trait values. Serializable to JSON for saves and sharing. Uses a seeded random generator so results are deterministic.
2. **Body plan.** The species archetype picks a skeleton: crawler (beetle), mollusk (snail), sessile (polyp, sponge), mat (algae, fungus), flyer (moth), or vat (tissue mass).
3. **Parts.** Segments, legs, shell, glands, jaws, spinnerets, antennae, placed by rules for that archetype and scaled by traits.
4. **Mesh.** Soft rounded bodies from blended spheres and capsules (signed distance shapes meshed once per species), plus simple primitives for limbs. Generated at edit time, never per frame.
5. **Material.** Chemistry decides the shader: chalky, chitin, metallic, glass, flesh, or glowing.
6. **Motion.** Fully procedural. Legs step with simple inverse kinematics as the body moves, antennae and tails follow with spring physics, glands pulse when producing.

Traits must be visible

| Trait | What changes on the creature |
| --- | --- |
| Output (calcite, silk, ore) | Gland or spinneret grows and glows brighter |
| Heat tolerance | Shell thickens and darkens, gains ridges |
| Cold tolerance | Body rounds out, gains a fuzzy or waxy coat |
| Swarm signaling | Longer antennae, rhythmic light pulses |
| Lifespan | Larger, slower body |
| Speed | Longer legs, slimmer body |

**Variation and drift.** Individuals in a swarm get small random offsets in size, hue, and gait so a crowd never looks cloned. Mutation drift between generations nudges traits and proportions, and the change is visible in both the organism and swarm views.

**Three levels of detail.** Full mesh in the organism view, a simplified instanced mesh in the swarm view, and a glowing icon in the galaxy view.

## Art and audio direction

Stylized, colorful, and alive. Bold saturated color, clean silhouettes, soft rounded forms, and gentle toon shading with a rim light so creatures pop against any background. Polish comes from lighting, motion, and color, not from detail.

Mood per view

| View | Setting | Lighting and color |
| --- | --- | --- |
| Organism | Specimen dish in a calm lab, creature on a slow turntable | Soft studio light, neutral backdrop so the creature's colors carry the screen |
| Swarm | Miniature diorama of the build site, slight tilt shift blur | Lit by the planet: Kessra is hot orange sun and teal sea, Vel Tor is cold blue dusk |
| Galaxy | Deep navy star map | Glowing planet nodes, seed ship trails, restrained bloom |

**Transitions.** The camera physically dives between views. Galaxy zooms into a planet, then down to the build site, then into a single creature. Never a hard cut.

**Interface.** Minimal and organic: rounded panels, teal accent for Seedling actions, amber for client requests, red only for problems. Never rely on color alone; pair it with an icon or shape.

**Touchstones.** Spore's creature charm, Townscaper's toy diorama warmth, Thrive's living cells.

**Audio.** Generated in code with the Web Audio API, no asset files. A soft ambient drone per planet, tiny clicks and chitters from workers, a warm chime when a structure completes. Sound is optional for the first slice.

## Game systems

Six systems carry the game. All run in a fixed simulation tick (10 per second) separate from rendering, with pause and 1x, 2x, 4x speed.

**1. Gene editing.** Each species has trait sliders from 0 to 100. Traits come in tension pairs, such as output versus lifespan and heat tolerance versus speed, so raising one lowers its partner. Every edit costs resources and takes effect on the next generation, not instantly.

**2. Mutation drift.** Each generation, every trait shifts by a small random amount plus a nudge from the environment. On a hot planet, survivors slowly gain heat tolerance but may lose output. The player can spend resources to slow drift but never stop it.

```
trait_next = trait + N(0, sigma) + pressure_env
```

**3. Swarm behavior.** Workers follow simple local rules with no central plan, the way termites build. Each worker loops: eat, gather material, follow a scent gradient to the build site, place one block next to existing structure, repeat. The player never steers individuals. They place markers: build here, avoid, feed station, rally point.

**4. Structures.** A blueprint is a voxel grid. Each placed block stores the traits of the worker that built it. Environment stress (heat, tide, cold) damages weak blocks over time, which shows up as visible cracks. This is how a bad gene shows up at swarm scale.

**5. Economy and logistics.** Resources: energy, feed, calcium, ore, silica, and the gene library. Colonies produce them. Seed ships carry them between worlds with real travel time, and living cargo can drift in transit.

**6. Contracts and threats.** Client species post contracts with planet conditions and a soft deadline. Rewards are trust, resources, and new traits sampled from local life. An invasive bloom spreads along shipping routes, eats feed, and weakens structures. It is countered by quarantining routes or by containment organisms in later milestones.

**No lose screen.** Failure costs time and trust, never the save. The game keeps going and the player adapts.

## Tech stack and architecture

A TypeScript web app using Three.js, with the simulation kept completely separate from rendering so Claude Code can test game logic without a screen.

| Layer | Choice | Why |
| --- | --- | --- |
| Language and build | TypeScript, Vite | Fast builds, strict types catch errors early |
| 3D rendering | Three.js, pinned version | Instancing for swarms, custom shaders, runs everywhere |
| Post effects | Three.js EffectComposer | Bloom, tilt shift, outlines |
| Interface | Preact with plain CSS | Small, fast panels over the 3D canvas |
| Simulation | Plain TypeScript in a Web Worker | Deterministic, testable in Node, never blocks rendering |
| Tests | Vitest for logic, Playwright for browser and screenshots | Lets Claude Code verify without a person |
| Audio | Web Audio API | No asset files |
| Saves | Browser storage plus JSON export | No server needed |
| Hosting | GitHub Actions to GitHub Pages | Every merge deploys to a public link |

Folder layout

```
src/
  sim/        pure game logic: genome, drift, swarm, structures, economy, contracts
  gen/        procedural organisms: body plans, meshes, materials
  render/     Three.js scenes for organism, swarm, galaxy, plus camera transitions
  ui/         Preact panels: gene editor, contract board, resource bars
  audio/      generated sound
  debug/      test hooks and dev overlay
data/         species.json, planets.json, contracts.json
tests/        unit tests and Playwright scenarios
docs/         design notes, screenshots, changelog
```

Architecture rules

- `sim/` never imports Three.js, Preact, or the DOM. It takes a seed and inputs and returns state.
- `render/` reads simulation snapshots and never changes game state.
- All tunable numbers live in `data/`, not in code.
- A debug hook on `window.__seedlings` lets tests jump to a view, fast forward ticks, set a seed, and read state.

**Performance budget:** 60 fps with 200 workers on a typical laptop, under 150 draw calls per frame, under 5 MB initial download.

## Autonomous workflow

Steve does not install or open any development software. Claude Code does all building, testing, and deploying. Steve plays the game from a link and gives feedback in plain language.

Every work session

1. Pick the top task from `docs/roadmap.md`, or turn new feedback in `docs/feedback.md` into tasks first.
2. Work on a branch. Write the code and unit tests.
3. Build, then run Playwright in headless Chromium with software WebGL. Load a fixed seed scenario and capture screenshots of all three views plus a short sequence of the swarm building.
4. Look at the screenshots. Check them against the art direction and the success criteria. Fix anything that looks wrong, broken, or ugly before moving on.
5. Compare against the previous screenshots and note anything that changed unexpectedly.
6. Merge to main only when tests pass and the screenshots look right. GitHub Actions deploys to GitHub Pages.
7. Append to `docs/changelog.md`: the link, the new screenshots, and three to five specific things for Steve to try.

Steve's loop

- Open the link and play for ten minutes.
- Reply with what felt good, what felt wrong, and what looked off. Rough notes are fine.
- Claude Code records it in `docs/feedback.md` and converts it into roadmap tasks.

**Scheduled runs.** This setup works with Claude Code Routines: each scheduled run completes one session above and stops. A broken build never reaches the live link.

## Milestone 1: the Kessra sea wall

One complete contract, playable end to end at a public link. If this slice is fun and looks good, every later milestone is expansion.

Scope

- **Organism view:** a procedurally generated mason beetle on a turntable. Four trait sliders: calcite output, heat tolerance, swarm signaling, lifespan. Tension pairs, edit costs, visible changes on the creature.
- **Swarm view:** 100 beetles building a sea wall from a voxel blueprint using local rules. Feed station, tide, and heat stress. Cracks form in blocks built by beetles with low heat tolerance. Player markers: build here, avoid, feed station.
- **Galaxy view:** Seedhome, Hollow Reach, Kessra, and a locked Vel Tor. One seed ship route carrying feed with real travel time. Resource bars and a contract board with the single Kessra contract.
- **Drift:** a new generation roughly every two minutes at 1x speed, with visible trait shifts.
- **Camera:** smooth dives between views. Keys 1, 2, 3 and mouse wheel zoom.
- **Out of scope:** other species, threats, Vel Tor contract, full audio, multiple saves.

Success criteria

- [ ] A new player completes the wall in 15 to 25 minutes at 1x speed
- [ ] With default genes, heat cracks appear within 5 minutes; heat tolerance of 60 or more stops new cracks
- [ ] Same seed produces an identical wall after 3,000 ticks (automated determinism test)
- [ ] 60 fps with 100 workers on a typical laptop
- [ ] View transitions take under one second
- [ ] A 10 minute automated play session produces zero console errors
- [ ] Beetles are clearly readable at swarm scale in screenshots
- [ ] Steve plays it and says the beetles are fun to watch

## Roadmap

Four milestones, each ending at a gate Steve checks by playing. The next milestone does not start until the gate passes.

- **M1 · Sea wall.** Vertical slice. Mason beetle, 3 views. Kessra contract. Drift, one seed ship. Gate: fun to watch, 60 fps, no errors.
- **M2 · Catalog.** Fiber weaver, glass. Light algae energy. Homes, mixed crews. Saves and audio. Gate: two species build one home.
- **M3 · Galaxy grows.** Vel Tor cold contract. Invasive bloom. Containment species. Supply network. Gate: bloom contained without combat.
- **M4 · Full biome.** Metal, meat, silk. Procedural planets. Client species art. Genome sharing.

After M4 comes onboarding, a final performance pass, and a decision on porting to Godot for a desktop release.

## Rules for Claude Code

Copy these into `CLAUDE.md` at the repo root. This brief lives at `docs/brief.md` and is the source of truth.

1. Never ask Steve to install, run, open, or edit anything. He only plays the live link and gives feedback.
2. Write everything addressed to Steve in short, plain language. No jargon.
3. One focused task per session. Small commits with clear messages.
4. Keep `main` deployable at all times. Merge only when tests pass and screenshots look right.
5. Always look at the screenshots before calling a task done. If it looks ugly or unclear, it is not done.
6. Every random value in `sim/` and `gen/` comes from the seeded generator. Same seed, same game.
7. Every new species needs a `basis` field in `species.json` naming the real organism or process it comes from.
8. No combat, ever. Pressure comes from environment, scarcity, time, and containment.
9. All names and text are original. Earthseed is inspiration, not content.
10. Pin every dependency to an exact version. Never adopt a release published in the last 14 days.
11. When something in the brief is unclear, pick the simplest reasonable option, note it in `docs/questions.md`, and keep going.
12. Stay inside the performance budget. Measure, don't guess.

Kickoff prompt

```
Read docs/brief.md and CLAUDE.md. Set up the repo, build pipeline,
and GitHub Pages deploy described there, then start Milestone 1 with
the procedural mason beetle in the organism view. End the session
with a changelog entry, screenshots, and the live link.
```
