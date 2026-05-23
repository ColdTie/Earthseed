# Effort #0002: Menifee Volunteer Opportunities Board

## The problem

People in Menifee who want to help their community do not have a single, current, actionable list of volunteer opportunities. What exists is scattered across JustServe, VolunteerMatch, individual organization websites, and Facebook posts. The gap is not that opportunities do not exist — they do. The gap is that someone who wants to spend a Saturday morning helping people cannot quickly figure out how to do that.

This problem is the mirror image of effort #0001. That effort helps people find where to receive help. This one helps people find where to give it.

## What we are building

A single web page listing volunteer opportunities in and near Menifee, with:
- What the work actually is (specific, not vague)
- Time commitment and schedule
- Requirements (background check? physical requirements? age?)
- Exactly how to sign up (phone number, URL, email — not "visit their website")
- Whether the opportunity is ongoing or event-based

The page is static HTML. Same format as the food resource page. Mobile-friendly.

## What "helped" means here

The primary signal is outbound clicks to sign-up links. If someone taps "Call to volunteer" that is a measurable action. Secondary signal is whether the volunteer organizations report new sign-ups attributable to this page.

Unlike the food page, wrong-door reports here are less about incorrect data and more about outdated postings (an organization that no longer needs volunteers, or an event that passed).

We will add a "Report a problem or suggest an organization" link so the community can help keep it current.

## What is out of scope for v1

- Volunteer scheduling or coordination tools
- Any login or account system
- Opportunities outside a 15-mile radius of Menifee unless they specifically serve Menifee residents

## Connection to Steve

This effort started because the person running this project wants to do something like Meals on Wheels. The TRIP volunteer driver program is the closest real match: drive a senior to appointments and errands, get mileage reimbursed, no training required. That is listed first and described in the most detail.

## Data freshness plan

Volunteer needs change faster than food pantry hours. Each entry has a `last_verified` date. On each agent run, flag any entries over 60 days old (shorter than the 90-day threshold for food resources, because stale volunteer listings waste people's goodwill).

## Next step after launch

After 30 days, check whether any organizations on the list confirm new volunteers arrived from this page. If yes, add more organizations. If no, figure out whether the distribution problem is bigger than the content problem.
