# Roadmap

Four milestones. Each ends at a gate Steve checks by playing. The next milestone does not start until the gate passes.

## Milestone 1: the Kessra sea wall

Gate: fun to watch, 60 fps, no errors.

Done
- [x] Repo, build pipeline, tests, GitHub Pages workflow
- [x] Simulation core in a worker: seeded RNG, genome, tension pairs, edit costs, drift with planet pressure, generations, heat stress, saves
- [x] Procedural mason beetle: signed distance body meshed once per edit, legs with inverse kinematics, antennae on springs, pulsing gland, traits visible
- [x] Organism view: specimen dish, turntable, toon shading with rim light, gene editor with four sliders, live marks, drift readouts, pending cost
- [x] Galaxy view: star map with four planets, one route, contract board
- [x] Swarm view: Kessra diorama with sea, blueprint ghost, feed station
- [x] Camera dives between views, keys 1 2 3, mouse wheel
- [x] Playwright scenarios with screenshots of all three views

Next, in order
1. **Swarm simulation.** 100 beetles with local rules: eat, gather, follow the scent gradient to the site, place a block next to existing structure. Voxel blueprint for the wall. Each block stores the builder's traits. Heat stress cracks weak blocks over time, visible as cracks. Instanced simplified beetle mesh in the swarm view. Feed station, tide, and heat stress at the site. This is the heart of the milestone.
2. **Player markers.** Build here, avoid, feed station. Placed by clicking in the swarm view.
3. **Lifespan and crews.** Workers die by lifespan and hatch by generation. Hungry crews stall. Worker count shown.
4. **One seed ship.** Hollow Reach to Kessra with real travel time, carrying feed. Resource bars reflect arrivals. Living cargo drifts in transit.
5. **Contract completion.** The wall counts as done when the blueprint is full and holding. Reward lands. A warm moment, no lose screen.
6. **Tilt shift and polish.** Bokeh pass in the swarm view, soft studio shadows in the dish, camera dive tuning, tiny clicks and chitters with the Web Audio API.
7. **Performance pass.** Measure 100 and 200 workers on a laptop GPU. Stay under 150 draw calls.
8. **Save export.** Download and load a JSON save.

Success criteria to verify at the end of the milestone
- [ ] A new player completes the wall in 15 to 25 minutes at 1x
- [ ] With default genes, heat cracks appear within 5 minutes; heat tolerance of 60 or more stops new cracks
- [x] Same seed produces an identical state after 3,000 ticks (automated, both Node and browser)
- [ ] 60 fps with 100 workers on a typical laptop
- [x] View transitions take under one second
- [ ] A 10 minute automated play session produces zero console errors
- [ ] Beetles are clearly readable at swarm scale in screenshots
- [ ] Steve plays it and says the beetles are fun to watch

## Milestone 2: catalog

Fiber weaver and glass sponge. Light algae energy. Homes and mixed crews. Saves and full audio. Gate: two species build one home.

## Milestone 3: galaxy grows

Vel Tor cold contract. Invasive bloom. Containment species. Supply network. Gate: bloom contained without combat.

## Milestone 4: full biome

Metal, meat, silk. Procedural planets. Client species art. Genome sharing.

After M4: onboarding, a final performance pass, and a decision on porting to Godot for a desktop release.
