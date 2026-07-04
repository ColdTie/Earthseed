# Effort #0004: Policy Impact — Menifee

## The problem

Most people in Menifee have no idea what their elected officials are doing or how it affects them. News about a bill passing in Washington or Sacramento reads like abstract noise until it cuts a specific program someone relies on, or changes a rule that affects their paycheck. By the time people realize a policy changed something real for them, it is too late to weigh in.

The gap is not that people don't care. The gap is that nothing translates "bill passed" into "here is what that means for you this week."

## What we are building

A single web page that:

- Lists every elected official representing Menifee residents (federal and state), with direct contact information — real phone numbers, not just "visit their website"
- Explains a small, curated set of current policies in plain language: what changed, who it affects in Menifee, what the concrete impact is, and how to reach your representative about it
- Links to authoritative sources for every claim — CBO scores, Legislative Analyst's Office analyses, agency guidance

The page is static HTML. Same format as the other pages in this project. Mobile-first.

## What this is not

This is not advocacy. The page does not tell people what to think about a policy. It says what the policy does, who it affects, and who represents them. What they do with that information is their business.

No scoring representatives. No endorsements. No framing like "your rep voted wrong." Just: here is what passed, here is who voted for it, here is how it affects Menifee households, here is the phone number to call.

## Scope for v1

Three to five policies maximum. Each one must meet all three criteria:
1. Currently in effect or on the ballot (not proposed, not speculative)
2. Directly affects a specific group of Menifee residents in a verifiable way
3. The impact can be described in one or two sentences without requiring a policy degree to understand

The first three policies identified for v1:
- **Medi-Cal work requirements** from the One Big Beautiful Bill Act (P.L. 119-21, enacted July 2025) — affects Medi-Cal enrollees 19–65, takes effect Dec 31, 2026
- **SNAP benefit changes** from P.L. 119-21 — changes to how energy assistance is counted affect SNAP household benefit amounts
- **SB 417** — Veterans and Affordable Housing Bond Act of 2026, signed by the Governor June 25, 2026, on the November 2026 statewide ballot — $11.25 billion ($10 billion for affordable housing programs, $1.25 billion for the CalVet Home Loan Program); Menifee voters will decide

LIHEAP is noted as a program under budget pressure (Trump administration has proposed eliminating it and laid off staff) but not yet cut. This is flagged as something to watch, not presented as an enacted change.

## What "helped" means here

Primary signal: do people who arrive on this page find their representative's phone number and use it? We cannot measure phone calls directly. But:
- We can track whether the page gets traffic
- The "report a factual error" link gives us a quality signal — if we have facts wrong, someone will say so
- If Steve shares the page in local groups, we can observe whether community members engage with it

Secondary: does this reduce "I didn't know about that" moments? Anecdotally, through the wrong-door email.

## Connection to other efforts

This page is stronger because the other resource pages exist. Explaining that Medi-Cal work requirements might affect IHSS eligibility is abstract on its own. Paired with a link to the IHSS card on the senior resource page, it becomes actionable. The policy page links to the resource pages. The resource pages link back to the policy page.

## Data freshness plan

Policy information goes stale fast. A bill status changes, a rule gets delayed, a program gets funded or defunded.

- Review each policy card before any agent run. If the status has changed, update or remove the card.
- The representative contact information should be re-verified every six months (elections happen).
- Every card has a `last_verified` date visible on the page.

## What is out of scope for v1

- Federal tax changes (complex, large surface area, hard to summarize accurately)
- City council decisions (different loop, closer to local news than policy translation)
- Any tracking or scoring of representative voting records
- Anything that reads as advocacy

## How to grow it

If v1 works — people find it, the facts hold up — the next step is to add a light notification mechanism: a simple email list where people who opt in get a note when a new policy card is added. That is not in v1. It requires an email service and consent handling. Get the page right first.
