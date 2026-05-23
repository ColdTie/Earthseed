# Effort #0001: Menifee Food Resources

## The problem

People in Menifee, CA who need food assistance have to navigate several separate organizations with different addresses, hours, eligibility rules, and documentation requirements. No single current and accurate list exists for the area. Wrong-door trips happen: someone drives to a pantry that is closed, or shows up at the student pantry without being a student, or does not know they need to bring a Social Security card.

Each wrong-door trip is a real cost to a real person. Fuel, time, childcare, hope spent on a closed door.

## What we are building

A single web page, hosted publicly, that lists every food resource serving Menifee with:
- Correct address
- Current hours (including any exceptions)
- Phone number
- Who is eligible
- What to bring
- Notes on anything that trips people up

The page is static HTML. No login, no tracking, no app to install. It loads on a phone with a slow connection.

## What "helped" means here

**Wrong-door reports** are the primary signal. We add a link at the bottom of the page: "Something on this page is wrong or out of date." Every report is an error we can fix and, by fixing, prevent from happening again.

Secondary signal: if the page gets consistent traffic from Menifee-area IPs, that tells us people are finding and using it.

A page with zero wrong-door reports after sustained use is either perfect or unused. We need to tell those apart.

## What is out of scope for v1

- Building a search or filter UI
- Collecting user data
- Adding resources outside Menifee city limits unless they explicitly serve Menifee residents
- Mobile app
- Translations (noted as a clear next step, not a v1 feature)

## Data freshness plan

Food pantry hours change. Organizations close. New ones open. The data file (`data/resources.json`) is the source of truth. On each agent run the agent should check for any reported errors and update the data if corrections are found. Each resource entry has a `last_verified` date so it is visible when data is stale.

## Measurement cadence

After the page is live:
- Check wrong-door report submissions weekly
- Re-verify each resource by phone every 90 days
- Update the LEDGER with what changed and what did not

## Next effort trigger

If wrong-door reports go to zero AND traffic confirms real use, the data quality is good. At that point the next useful question is: which resources have the hardest-to-navigate eligibility rules, and can we make those clearer?

If traffic never materializes, the distribution problem is bigger than the content problem. Then the question is how to get the URL in front of people who need it.
