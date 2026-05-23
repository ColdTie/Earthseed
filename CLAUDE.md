# Earthseed: Agent Instructions

Read this first, every run. Update it when something here becomes untrue.

## What this is

Two connected projects running in parallel:

**Community resources.** Verified, maintained local information for people in Menifee who need food, transportation, senior services, or utility help. The gap being filled is that this information exists but is scattered, outdated, and hard to find. Static HTML pages that load on a slow phone. Measured by wrong-door reports going to zero.

**VoterImpact.** A civic tool that translates legislation into personal impact. You enter your zip code, income, and honest answers to a few policy questions. The tool shows how your representatives actually voted on laws that affect your specific situation. Non-partisan — no candidate recommendations, no advocacy. Just: here is what passed, here is who voted for it, here is what it means for someone in your situation. You decide. Built to be shared on Instagram and Facebook so it spreads.

The connection: the resource pages treat the symptom. VoterImpact addresses the cause. Both belong here.

## What I should do every run

Build something. If there is an obvious next step, take it. If a new effort is worth starting, start it. Research, write, code, test, commit, push.

Generate at least one concrete revenue or growth idea per run. Not vague — specific. Who pays, how much, what the ask is.

Think about where this goes in two and five years. Not just the next task. The destination shapes what the next task should be.

Write what was done in the LEDGER. Be honest about what worked and what did not.

## The future this is building toward

Near term: VoterImpact works well enough in Menifee that it gets shared in local Facebook groups and community feeds. People start using it before elections. The resource pages get traffic and wrong-door reports confirm the data is accurate.

Medium term: VoterImpact expands beyond Menifee. Grant funding (CIELO Fund, District 5 grants) covers operating costs. The directory methodology gets sold to one local organization as a paid service.

Long term: A legal entity exists — company or nonprofit, whichever fits better. Revenue comes in. A portion goes out as direct donations to people and causes, operated the same way everything else here is: researched carefully, documented clearly, proposed by the agent, approved and sent by Steve.

The tool that makes all of this real is VoterImpact at scale. If enough people use it, it is worth funding. If it is worth funding, this becomes a real operation.

## What is built so far

Four static pages on branch `claude/optimistic-volta-9wjVc`, merged and waiting for GitHub Pages to be enabled:
- #0001: Menifee food resources
- #0002: Menifee volunteer opportunities  
- #0003: Menifee senior resources
- #0004: VoterImpact v1 — static, reps + policy cards

**Next build: VoterImpact full version.** Real web app. Zip code input calls Google Civic Information API (free) to identify the user's actual representatives. Income range selection. Short policy quiz. Personalized output: here is how your specific reps voted on laws that affect someone in your bracket. Shareable result card for social media. ProPublica Congress API (free with key) for voting records.

## Revenue — next concrete steps

- CIELO Fund (IECF): opens December 1, 2026. Up to $15,000. No legal entity required. Draft in November.
- Riverside County District 5 grants: rolling. Contact rivcodistrict5.org to ask about the process.
- Directory pilot: pitch Menifee Union School District or one local hospital on a maintained resource directory. Target $500/month.
- VoterImpact sponsorship: once the tool has traffic, local civic organizations, credit unions, or nonpartisan PACs may pay to sponsor it.

## Data freshness

Food resources: reverify by phone every 90 days.
Volunteer listings: flag stale entries every 60 days.
Policy cards: review status every run. Bills change fast.
Representative contact info: reverify every 6 months.

## Rules

No surveillance. No scraping private data. No consent violations.
Non-partisan on political content. Report facts. Do not tell people what to think.
Say what is true. Say what was actually done. No inflated language.
