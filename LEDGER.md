# Ledger

This file is the memory of what has been done. Every agent run that changes something adds an entry here. Entries go newest first.

---

## 2026-05-23 — Third pass: GitHub Pages setup and effort #0003 senior resource page built

**What was done:**

Set up the repository for GitHub Pages hosting. Created `index.html` at the repo root as a landing hub page linking to all three effort sites. Added `.nojekyll` to prevent Jekyll from interfering with the static files. Added back-to-home footer navigation in the food and volunteer pages. Fixed the placeholder URL in the volunteer page's status bar (it pointed to `menifee-food.example.com`; now points to the correct relative path).

Built effort #0003 (Menifee Senior Resource Guide) as a full static page at `efforts/0003-menifee-seniors/site/index.html`. The page was built after researching each of the five open questions from the #0003 charter. Findings:

1. **Senior center in Menifee confirmed.** Kay Ceniceros Senior Center, 29995 Evans Road, Menifee 92586. City-operated, Mon–Fri 8 AM–5 PM. Has a Title III-C congregate lunch program Mon–Fri 11:30 AM–12:30 PM, $3 suggested donation, 24-hour advance reservation required. Open to adults 60+. Two phone numbers appear: (951) 679-0119 (lunch reservations) and (951) 672-9673 (general). Both are included on the page with a flag to verify which is current.

2. **No Riverside County OOA office in Menifee.** Nearest satellite is Temecula. All county programs are accessed via Senior HelpLink: 1-800-510-2020 or (877) 932-4100.

3. **Congregate meals confirmed at Kay Ceniceros.** Operated in partnership with Family Service Association (FSA) under Riverside County OOA Title III-C grant.

4. **Utility assistance programs documented.** LIHEAP through CAP Riverside (951) 955-4900; SCE CARE (30–35% off), FERA (18% off for households of 3+), Medical Baseline (no income requirement, medical conditions); SoCalGas CARE (20% off), Gas Assistance Fund (one-time up to $200, extra $100 if any household member is 55+). Did not list "REACH" — could not confirm it still exists under that name.

5. **Welfare check program confirmed.** Menifee PD runs the YANA (You Are Not Alone) program — proactive wellness call check-in for enrolled seniors. Free. Family members can refer a senior. Contact: DG_PD_Volunteers@menifeepolice.org or mail to Menifee PD ATTN: YANA, 29714 Haun Rd Unit A, Menifee CA 92586. One-time welfare check: non-emergency line (951) 677-4964.

6. **Vial of Life confirmed.** Riverside County Fire program. Kits at Menifee fire stations and City Hall. No cost.

Also added to the page: HICAP free Medicare counseling (1-800-434-0222; confirmed at Temecula, may be at Kay Ceniceros — flagged to call ahead), Family Caregiver Support Program (RC OOA, (877) 932-4100), ICLS free legal aid for seniors (serves Menifee ZIPs, (888) 245-4257), Adult Protective Services 24/7 hotline ((800) 491-7123), MSSP in-home care management (for Medi-Cal-eligible frail seniors).

Updated the root landing page: removed the "coming soon" state for senior resources and linked the live page.

**To enable GitHub Pages:** Go to repo Settings > Pages. Set Source to the branch this PR merges to, folder: / (root). The site will be at `https://coldtie.github.io/Earthseed/`. Three pages are live once this is published: food resources, volunteer board, senior resources.

**What is flagged for follow-up:**

- Kay Ceniceros Senior Center has two phone numbers in different sources: (951) 679-0119 and (951) 672-9673. Call to confirm which does what before the page has wide circulation.
- HICAP counseling at Kay Ceniceros is unconfirmed. Call 1-800-510-2020 to ask before telling Menifee seniors to go there for that service.
- SoCalGas "REACH" program: could not confirm it currently exists under that name. Did not list it.
- Meals on Wheels Riverside: could not confirm they serve Menifee ZIP codes. Did not list them. Call riversidemow.org if this becomes relevant.
- Sun City Civic Association: listed address discrepancy (26850 vs. 28650 Sun City Blvd). Not included on the page since it is a members-only HOA, not a public senior center.
- Both the #0001 and #0002 pages still need a public URL distributed (local Facebook groups, school district pages, city resources page) to get meaningful traffic. The #0003 page is now in the same position.

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
