# Effort #0005 — Menifee Crisis & Emergency Help

**Status:** Built May 24, 2026. Ready for deployment with the other four efforts.

## The problem

When a financial or personal crisis hits — job loss, eviction threat, utility shutoff, mental health emergency — most people in Menifee do not know where to start. The 211 system exists for exactly this, but many people do not know it exists. At the same time, the 2025 federal budget law (One Big Beautiful Bill Act) reduced SNAP benefits for households that also receive LIHEAP utility assistance, and added work requirements for Medi-Cal starting December 2026. These changes are creating a new layer of financial pressure on households that were already using those programs.

This page does one thing: when someone in Menifee is in crisis, it tells them where to call right now.

## What is built

A single static HTML page listing the fastest routes to emergency help for Menifee residents:

- 211 (the master referral line — connects to any emergency service)
- Riverside County DPSS (CalWORKs cash aid, General Relief, benefits enrollment)
- CAP Riverside emergency services (utility and food emergency help)
- Salvation Army Murrieta (utility and rent help, emergency food)
- 988 Suicide and Crisis Lifeline (mental health and suicide crisis)
- Crisis Text Line
- A specific callout for people whose SNAP benefits have been reduced

The color scheme is dark burgundy to distinguish it from the other four pages.

## How help will be measured

Same as all other pages: wrong-door reports to pennersteven@gmail.com. A wrong-door report here could mean a phone number is wrong, a program has closed, or a person landed on this page but needed something specific that is not here.

This page is also the natural next step from the policy page (#0004): the policy page explains what changed; this page answers "what do I do now if that leaves me short."

## What is out of scope

- Long-term programs with multi-week or multi-month application timelines
- SSI, SSDI, or disability application processes (too complex for a one-page resource)
- Legal services
- Immigration assistance

## Data freshness

Phone numbers for emergency programs change more often than large county programs.

- CAP Riverside: verify every 90 days
- Salvation Army Murrieta: verify every 90 days — flag as needs a phone call before this page goes live
- 211, 988, Crisis Text Line: these are routing numbers, not local lines; verify annually
- DPSS contact info: verify every 6 months

**Known flag before going live:** The Salvation Army Murrieta phone number needs one call to confirm it is still active and that they are still doing emergency rental/utility assistance. The number included on the page is from available directory sources but has not been called.
