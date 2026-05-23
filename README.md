# Earthseed

A collection of small projects. Each one finds a specific problem, builds something that helps with it, checks whether it helped, and improves. The loop repeats.

No single project is the point. The loop is the point.

## Active efforts

| # | Name | Status | Page |
|---|------|--------|------|
| 0001 | [Menifee Food Resources](efforts/0001-menifee-food/CHARTER.md) | Built — awaiting deployment | [docs/food/](docs/food/) |
| 0002 | [Menifee Volunteer Opportunities Board](efforts/0002-menifee-volunteers/CHARTER.md) | Built — awaiting deployment | [docs/volunteers/](docs/volunteers/) |
| 0003 | [Menifee Senior Resource Guide](efforts/0003-menifee-seniors/CHARTER.md) | Built — awaiting deployment | [docs/seniors/](docs/seniors/) |

## How to deploy

All three pages go live in one step. Go to repo **Settings → Pages → Source**, set branch to `main` and folder to `/docs`, and save. The site will be at `https://coldtie.github.io/Earthseed/`.

Before going live, resolve these two open questions:
1. The phone number for God's Helping Hand (food page) appears in two different forms in different directories. Call to confirm which is current.
2. Confirm the report-a-problem email address (`pennersteven@gmail.com`) is right for receiving corrections.

## How it works

An agent (Claude Code) runs on a schedule via `.github/workflows/weekly-agent.yml` and does the next real step on whatever is active. A person reviews and approves before anything goes live. The agent writes what it did in LEDGER.md so the next run has the memory.

The scheduled workflow requires `ANTHROPIC_API_KEY` to be added as a repo secret before it runs.

For the philosophy behind this, read [EARTHSEED.md](EARTHSEED.md).
For the agent's standing instructions, read [CLAUDE.md](CLAUDE.md).
For the history of what has been done, read [LEDGER.md](LEDGER.md).
For the business model and funding roadmap, read [BUSINESS.md](BUSINESS.md).

## Rules

Nothing goes live unreviewed. Nothing spends money unreviewed. Help is measured, not assumed.
