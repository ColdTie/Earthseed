# Questions and the choices made

When the brief is unclear, the simplest reasonable option is taken and recorded here so Steve can overrule it.

## 2026-10-10

**Which traits pull against which?** The brief names output versus lifespan and heat tolerance versus speed as examples. The third pair is not named. Chosen: cold tolerance versus swarm signaling. All three pairs live in `data/species.json` and are easy to change.

**Does raising heat tolerance lower calcite output?** The Kessra walkthrough says it does, but the tension pairs say heat tolerance pulls against speed. Chosen: the named pairs stand. Heat tolerance edits cost calcium, which is also the input for calcite, so the squeeze on calcite still happens through the resource rather than through the trait.

**When does an edit cost resources?** Chosen: the cost is reserved while you drag and paid when the next generation hatches. Moving a slider back to its live value costs nothing. If the resources are gone when the generation turns, the edit does not land and the log says why. This keeps exploring free and the gate honest.

**What does the organism view show, the live crew or the plan?** Chosen: the dish shows the plan for the next generation, so every slider move changes the creature right away. A dark tick on each slider marks the live value.

**How many traits in the first slice?** Six are in the genome (output, heat tolerance, cold tolerance, swarm signaling, lifespan, speed). Four sliders are shown, as the milestone says. The other two still move through tension pairs and drift, and still shape the creature.

**Feed at Kessra.** The brief says feed is short so the player routes a seed ship. Seed ships are not simulated yet. Chosen for now: Kessra has a small feed trickle and the crew eats slowly, so feed lasts about half an hour at 1x. Logistics will tighten this on purpose.

**Folder layout.** The brief lists `sim gen render ui audio debug`. An `app/` folder was added for the main thread glue (worker client, stage with camera dives) because it is neither pure simulation nor a scene.

**Audio.** Optional for the first slice. Not built yet.

**Deployment.** The workflow deploys on every push to `main` and asks GitHub to enable Pages on first run. If GitHub refuses to enable it from a workflow, Pages has to be switched on once in the repository settings, with source set to GitHub Actions. That is a one time human step and is noted in the changelog.
