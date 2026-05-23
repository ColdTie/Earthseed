# Ledger

This file is the memory of what has been done. Every agent run that changes something adds an entry here. Entries go newest first.

---

## 2026-05-23 — Second pass: volunteer board, senior charter, business model, food page expanded

**What was done:**

Researched volunteer opportunities in Menifee and SW Riverside County. Key finding: the TRIP (Transportation Reimbursement and Information Project) volunteer driver program run by Independent Living Partnership is the closest real equivalent to Meals on Wheels available to Menifee residents. Volunteer drivers help seniors and disabled residents get to appointments and errands; the county reimburses riders 45 cents per mile so they can pay the driver back. No training required. Call (951) 653-0740 to sign up.

Also found: Menifee Valley Community Cupboard is actively looking for volunteers as of April 2025. Project T.O.U.C.H. (homeless prevention housing, Menifee) takes volunteers. THINK Together runs tutoring in Menifee/Perris schools and needs volunteer tutors. Menifee Better Together runs city beautification events. Riverside County RSVP program places volunteers 55+ in community roles.

Found that the Riverside County Office on Aging has a Home Delivered Meals Program that covers all of Riverside County including Menifee, but it is not widely known. Added this to the #0001 food resource page as a new card and to the JSON data file.

Created effort #0002 (Menifee Volunteer Opportunities Board): CHARTER.md and a full static HTML page at efforts/0002-menifee-volunteers/site/index.html. The TRIP program is featured prominently as the best match for someone who wants to help seniors directly.

Created effort #0003 (Menifee Senior Resource Guide): CHARTER.md only. Page not built yet — needs more research on senior centers, congregate meals, and county outreach points in Menifee before building. The most urgent piece (county home-delivered meals) is already on the food page. Noted that if Steve begins TRIP driving, firsthand knowledge from that will improve this page significantly.

Created BUSINESS.md with honest assessment of three revenue paths: grants (specific targets listed including District 5 supervisor grants and IECF CIELO Fund), directory-as-a-service to organizations with outdated resource lists, and the long-term giving model. CIELO Fund is the first application to pursue — opens December 1, up to $15K, no entity required.

Updated README.md and CLAUDE.md instructions to reflect new efforts.

**What is flagged for follow-up:**

Same flags as before, plus:
- Both pages need hosting before they can be measured. GitHub Pages is the simplest path.
- CIELO Fund application opens December 1, 2026. Draft it in November.
- District 5 supervisor grants: no published deadline found. Contact rivcodistrict5.org directly to ask about the process and timeline.
- Before starting the #0003 senior page, research whether there are any senior centers physically in Menifee (Sun City has a history as a senior community) and whether the County has an outreach point there.

---

## 2026-05-23 — First run: repository initialization and effort #0001 v1

**What was done:**

The repository was empty. This run initialized it from scratch.

Created the seed files: CLAUDE.md (agent standing instructions), EARTHSEED.md (project philosophy), README.md, LEDGER.md (this file).

Created effort #0001 structure at `efforts/0001-menifee-food/`.

Wrote CHARTER.md for effort #0001, covering the problem, what is being built, how help will be measured, and what is out of scope for v1.

Researched food resources in Menifee, CA using web search against organization websites, findhelp.org, foodpantries.org, city government calendars, and related directories. Found six resources with enough data to list:

1. Menifee Valley Community Cupboard — the primary local resource, Mon–Fri 10 AM–2 PM, 26808 Cherry Hills Blvd. Solid data; hours confirmed from multiple sources.
2. God's Helping Hand Food Banks — Wednesdays 10 AM–noon, 28125 Bradley Rd. Flagged for reverification: two different phone numbers appear in different directories.
3. City of Menifee Food Box Distribution — periodic events at La Ladera Park. Not weekly; check cityofmenifee.us for schedule.
4. MSJC Food 4 Thought Pantry — students only, Mon–Tue 9 AM–2 PM at Menifee Valley Campus.
5. Salvation Army Murrieta Corps — appointment required, Mon–Fri 8:30–11:30 AM, located in Murrieta but explicitly serves Menifee.
6. MilVet Food Pantry — veterans and military only, Tuesdays 1–5 PM, walk-in, in Murrieta.

Saved all resource data to `efforts/0001-menifee-food/data/resources.json` with `last_verified` dates, flags for data that needs reverification, and structured hours for machine use.

Built the v1 tool at `efforts/0001-menifee-food/site/index.html`: a mobile-first static HTML page that shows all resources with address, hours, eligibility, what to bring, and an open/closed status computed from the current day. Includes a "Report a problem" mailto link for wrong-door reports.

**What is flagged for follow-up:**

- God's Helping Hand has two phone numbers in different sources. Needs a phone call to verify which is current before going live.
- MSJC hours note says "effective November 2025" — should confirm these are still the current hours.
- The report-a-problem link uses pennersteven@gmail.com directly. Before the page is live, confirm this is the right address for receiving corrections.

**What "live" means for this effort:**

The page needs to be hosted somewhere publicly accessible. Options: GitHub Pages on this repo, Netlify, or any static host. Hosting requires human review and approval first.

**Next step after approval:**

Deploy the page. Then, after two weeks of real use, check whether any wrong-door reports came in. If they did, fix the data. If none came in and traffic is low, the problem is distribution: get the URL in front of people who need it (local Facebook groups, school district resources page, city services page).

---
