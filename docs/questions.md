# Questions and the choices made

When the brief is unclear, the simplest reasonable option is taken and recorded here so Steve can overrule it.

## 2026-10-10

**Which traits pull against which?** The brief names output versus lifespan and heat tolerance versus speed as examples. The third pair is not named. Chosen: cold tolerance versus swarm signaling. All three pairs live in `data/species.json` and are easy to change.

**Does raising heat tolerance lower calcite output?** The Kessra walkthrough says it does, but the tension pairs say heat tolerance pulls against speed. Chosen: the named pairs stand. Heat tolerance edits cost calcium, which is also the input for calcite, so the squeeze on calcite still happens through the resource rather than through the trait.

**When does an edit cost resources?** Chosen: the cost is reserved while you drag and paid when the next generation hatches. The crew cannot spend reserved resources, so an accepted edit always lands. "Undo edits" returns to the live genes for free. Dragging a slider back by hand can leave a cost of under one unit after drift, because drift leaves tenths that a whole number slider cannot hit exactly. If an edit is refused, the slider says which resource is short.

**What does the organism view show, the live crew or the plan?** Chosen: the dish shows the plan for the next generation, so every slider move changes the creature right away. A dark tick on each slider marks the live value.

**How many traits in the first slice?** Six are in the genome (output, heat tolerance, cold tolerance, swarm signaling, lifespan, speed). Four sliders are shown, as the milestone says. The other two still move through tension pairs and drift, and still shape the creature.

**Feed and calcium at Kessra.** The brief says feed is short so the player routes a seed ship. Seed ships are not simulated yet. Without them, a pre-merge review found calcium ran out in about 10 minutes and feed in about 29, after which every gene edit was refused for good. Chosen for now: Kessra has a calcium trickle (calcium from seawater, 0.08 per tick) and a feed trickle that exactly matches what 100 beetles eat (0.03 per tick). Default genes never run dry. A crew pushed to maximum output still burns calcium faster than it arrives, which is the trade-off the output slider should carry. When seed ships arrive, feed income drops back so that shipments matter.

**Folder layout.** The brief lists `sim gen render ui audio debug`. An `app/` folder was added for the main thread glue (worker client, stage with camera dives) because it is neither pure simulation nor a scene.

**Audio.** Optional for the first slice. Not built yet.

**Which branch is main?** The repository has no `main`. Its default branch is `claude/optimistic-volta-sgxeY`, and earlier pull requests merged there. Chosen: treat the default branch as `main`. The workflow deploys from whichever branch is the default, and also lists `main`, so a later rename in settings needs no code change.

**Deployment.** GitHub Pages was already on, in "deploy from a branch" mode, serving the old landing page from the default branch. The brief asks for GitHub Actions to deploy, and GitHub only accepts deploys from a workflow when the Pages source is set to "GitHub Actions". A workflow cannot change that setting itself. It is a one time change by the repository owner, recorded in the changelog. Until it is made, the deploy job fails and GitHub keeps publishing the raw branch, where the page shows only a loading message.

**GitHub Actions versions.** Workflow steps use major version tags such as `actions/checkout@v4`, the usual practice for GitHub's own actions. Rule 10 is applied to npm packages, which are pinned exactly.

**Tension pairs and slider limits.** The partner trait moves by exactly half of each edit, kept to two decimals, so ten small steps land where one big jump does. When the partner would pass 0 or 100, the edit stops at that limit, so moving a slider back always undoes it exactly.

**Mesh detail while dragging.** A full detail beetle takes about 50 ms to build. While a slider moves, the beetle is rebuilt at lower detail (about 17 ms) a few times a second, then once at full detail a quarter second after the slider stops.
