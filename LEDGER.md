# Ledger

This file is the memory of what has been done. Every agent run that changes something adds an entry here. Entries go newest first.

---

## 2026-06-15 — Data freshness check and new resource added

**What was checked:**

Gmail searched for wrong-door reports to pennersteven@gmail.com in the last 30 days. None found. The pages are not yet live (GitHub Pages not enabled), so this is expected — no one has used them yet.

GitHub repo confirmed all four effort pages are on main and the root index.html exists. The human action still required is: Settings → Pages → select main branch / root folder to enable GitHub Pages.

Web search was run on the three highest-risk data points:

1. **God's Helping Hand phone number** — The primary number (951) 973-3582 is confirmed on ghhministries.com, which is the organization's own website. The alternate number (951) 679-4667 still appears in third-party directories. The current note on the food page ("try 973-3582 first") is accurate. No change needed.

2. **MSJC Food 4 Thought** — The program was confirmed open through May 19, 2026, and follows the MSJC academic calendar. It is likely on summer break as of June 15. The old note referenced "hours effective November 2025" which was confusing. Updated to say the pantry follows the academic calendar and may be closed during summer and winter breaks.

3. **City of Menifee Food Box (La Ladera Park)** — Data previously referenced only 2025 dates. A February 2026 event was confirmed from the city calendar. Updated the schedule description to reference the confirmed 2026 event.

**New resource found and added:**

**Kay Ceniceros Senior Food Box** — The city-run senior center offers a free monthly food box for Menifee residents 60 and older. Approximately 40 lbs of canned goods, rice, juice, and cereal per box. Events run 10:30 AM to 1 PM. Call (951) 672-9673 for the next event date. This program appears on cityofmenifee.us, findhelp.org, and was reported in Canyon Lake Insider. It was not in the food page or the senior page.

**Files changed:**

- `efforts/0001-menifee-food/data/resources.json` — Added `kcsc-senior-food-box` entry; updated MSJC and city food box notes; updated `last_full_review` to 2026-06-15.
- `efforts/0001-menifee-food/site/index.html` — Added Kay Ceniceros Senior Food Box card (in "In Menifee" section, between the City Food Box and the RC Home Delivered Meals cards); updated MSJC note; updated City food box schedule text; updated "Data last reviewed" date.
- `efforts/0003-menifee-seniors/site/index.html` — Added monthly food box note to the Kay Ceniceros card.
- `LEDGER.md` — this entry.

**What is still flagged:**

- GitHub Pages still needs to be enabled by Steve. No measurement is possible until the pages are live.
- GHH phone number: both numbers still appear in different sources. This will not resolve without a phone call to (951) 973-3582 to confirm. Currently noted as a warning on the food page — sufficient for launch.
- MSJC summer hours: the page now warns about academic calendar breaks, but actual summer 2026 hours are unconfirmed. Visiting students should call (951) 542-1011 or email EaglesLanding@msjc.edu before going.
- Kay Ceniceros food box dates: monthly, but specific dates are not published far in advance. Calling ahead is required. The page reflects this.
- Next 90-day phone verification window: August 23, 2026 (90 days from original May 23 build).

---

## 2026-05-23 — Fourth pass: VoterImpact / policy page added as effort #0004

**What was done:**

At Steve's request, added a policy impact effort to the project — a page that breaks down how current legislation affects Menifee residents and gives direct contact information for every elected representative.

Research: Identified four policies worth covering at launch.

1. **Medi-Cal work requirements** (One Big Beautiful Bill Act, P.L. 119-21, enacted July 4, 2025): Adults 19–65 on Medi-Cal expansion must document 80 hours/month of work, training, education, or volunteering starting December 31, 2026, or lose coverage. Exemptions exist for medically fragile, pregnant, caregivers of young children — but require paperwork to claim. Directly affects Menifee residents using IHSS.

2. **SNAP benefit changes** (same law): Changed how energy assistance is counted in the SNAP benefit formula, reducing monthly benefits for households that receive both SNAP and LIHEAP. SNAP projected to be 36% smaller by 2034 vs. prior projections.

3. **LIHEAP** (not yet cut, but under threat): The Trump administration proposed eliminating LIHEAP entirely and laid off the federal program staff. The program was NOT cut by the OBBBA and continues to operate. Congressional appropriations will determine its future. Marked as "watch" rather than "enacted."

4. **SB 417** (California Affordable Housing Bond Act of 2026): $10 billion bond on the November 2026 statewide ballot. Funds affordable rental housing, homeownership assistance, and preservation. Voters decide.

**Representatives documented:**
- U.S. House, CA-41: Ken Calvert (R), (951) 784-0831
- U.S. Senate, CA: Alex Padilla (D), (310) 231-8535
- U.S. Senate, CA: Adam Schiff (D), (310) 228-9581
- CA Assembly, D-63: Bill Essayli (R), (951) 580-4610
- CA Senate, SD-32: Kelly Seyarto (R), (951) 926-6164

**Built:**
- `efforts/0004-policy-impact/CHARTER.md` — charter with scope, what it is not, data freshness plan
- `efforts/0004-policy-impact/site/index.html` — static HTML, slate blue color scheme, four policy cards with status badges (enacted / ballot / watch), vote records, impact summaries, and direct phone CTAs for each representative
- Updated `index.html` root to include the policy page as a fourth directory card
- Patched a dangling-tag bug in the root index that appeared during the edit

**Design notes:** Each policy card shows the status badge (Enacted, On Ballot, Watch), the plain-language explanation, who specifically in Menifee it affects, how their representatives voted, and a direct call CTA. All claims link to primary sources (KFF, Georgetown CCF, Congressional Research Service, CalMatters).

**Tone note:** The page is explicitly non-partisan. It reports what laws do and who voted for them. It does not say whether the policies are good or bad.

**What is flagged for follow-up:**
- Representative phone numbers should be reverified; district office numbers can change after elections or office reshuffles. Current numbers sourced from official .house.gov and .senate.gov pages.
- Vote records: Ken Calvert's vote on the OBBBA is confirmed (voted for it). Adam Schiff's position is noted as "not yet in Senate at time of vote" — he won his seat in the November 2024 election and was seated in January 2025, several months before the bill passed in July 2025. Verify whether he had a Senate vote on this. If so, update the vote chip.
- SB 417 ballot status: confirm it is officially certified for the November 2026 ballot once that is announced.
- LIHEAP: update the card immediately if Congress appropriates or eliminates funding.

---

## 2026-05-23 — Third pass: senior resource page built, GitHub Pages setup, cross-links fixed

**What was done:**

Researched the five open questions from the #0003 charter. Key findings:

**Senior centers:** Kay Ceniceros Senior Center exists and is city-run. Address: 29995 Evans Rd, Menifee, CA 92586. Phone: (951) 672-9673. Hours: Mon/Wed/Fri 8am-5pm, Tue/Thu 8am-7:30pm. Congregate lunches Mon-Fri 11:30am-12:30pm — reservation required 24 hours ahead. Also serves as a cooling center on extreme heat days. Programs include fitness, T'ai Chi, crafts, card games, ping pong, and more. This is a substantial, active senior center.

**TRIP:** Found that cityofmenifee.us has its own TRIP page (cityofmenifee.us/1079), confirming the program is recognized locally. Enrollment still goes through Independent Living Partnership at (951) 653-0740.

**YANA (You Are Not Alone):** Menifee Police runs a free volunteer-based wellness check program. Volunteers call seniors living alone at prearranged times. If no answer, they contact the emergency contact, then neighbors, then visit in person. Register by emailing DG_PD_Volunteers@menifeepolice.org or by mailing an application to Menifee PD, 29714 Haun Rd Unit A, Menifee CA 92586. Only requirement: able to answer the phone and provide one emergency contact. This was a real find — it is exactly the kind of program people do not know exists.

**IHSS (In-Home Supportive Services):** Riverside County program that pays for in-home care for Medi-Cal-eligible seniors 65+ or disabled. Covers housecleaning, meal prep, personal care, accompaniment to appointments. A family member can be the paid caregiver. Apply at RiversideIHSS.org or call (888) 960-4477, Mon-Fri 7:30am-5:30pm.

**Utility assistance:** LIHEAP administered by Community Action Partnership of Riverside County. Phone: (951) 955-4900. Seniors 60+ are a priority group. Includes weatherization services (insulation, weather stripping, minor repairs). Appointment required after phone pre-screen.

**Minor Home Repair Grant:** City of Menifee offers up to $10,000 in grant funds to eligible seniors for home repairs. Call (951) 672-6777 for current eligibility rules. Found via cityofmenifee.us Older Adult Resources page.

**Family Caregiver Support:** Riverside County Office on Aging runs a free program covering counseling, case management, respite care, support groups, and Care Pathways (free 11-week educational workshop). Call (877) 932-4100.

Built the #0003 senior resource page at `efforts/0003-menifee-seniors/site/index.html`. Warm amber color scheme to differentiate from the food page (green) and volunteer page (teal). Same card-expand format. Open/closed badges for Kay Ceniceros and the Home Delivered Meals intake line. Eight resource cards total.

Created `index.html` at the repository root — a clean landing page that links to all three resource directories. This enables GitHub Pages: once Steve enables Pages in GitHub repository settings (Settings → Pages → select the branch and root folder), all three pages will be publicly accessible at `https://coldtie.github.io/Earthseed/`.

Fixed the placeholder link on the volunteer page (was `https://menifee-food.example.com`). Updated the status bar on all three pages to cross-link to each other using relative paths.

**What is flagged for follow-up:**

- GitHub Pages must be enabled manually in repository settings by the repo owner. Once enabled, the pages are live at the GitHub Pages URL above. That is the human action required before anything is measurable.
- The YANA program is the most time-sensitive item to share. Anyone who knows a senior living alone in Menifee should know this program exists.
- God's Helping Hand still has two phone numbers that need verification. This is flagged in the data file. Before the food page goes live, one phone call would resolve it.
- After pages are live: check wrong-door reports on food page weekly, check volunteer page for stale listings every 60 days, re-verify all resources by phone every 90 days.
- CIELO Fund application: opens December 1, 2026. Begin drafting in November.

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
