# Hosting

The three resource pages are static HTML. They cost nothing to host on GitHub Pages.

## How to go live (one-time setup)

1. Merge the current working branch to `main`.
2. Go to this repository on GitHub: Settings → Pages.
3. Under "Build and deployment", change the Source from "Deploy from a branch" to **"GitHub Actions"**.
4. Click Save.

The workflow at `.github/workflows/pages.yml` runs automatically on every push to `main`. It copies the three pages into a flat structure and deploys them.

## URLs once live

| Page | URL |
|------|-----|
| Landing page | https://coldtie.github.io/Earthseed/ |
| Food resources | https://coldtie.github.io/Earthseed/food/ |
| Senior resources | https://coldtie.github.io/Earthseed/seniors/ |
| Volunteer opportunities | https://coldtie.github.io/Earthseed/volunteers/ |

## Custom domain (optional, later)

If you want a shorter URL — something like menifeeresources.org — you can register a domain and point it at GitHub Pages. GitHub will handle HTTPS automatically. This is not required to go live; the github.io URL works fine for sharing.

Steps when ready:
1. Register a domain (Namecheap, Porkbun, or similar — roughly $10–$15/year).
2. In the domain registrar, add a CNAME record pointing to `coldtie.github.io`.
3. In GitHub → Settings → Pages → Custom domain, enter the domain.
4. GitHub issues a free HTTPS certificate automatically.

## What "live" means for measuring impact

Once the pages are accessible, the next step is getting the URLs in front of people who need them:

- Post in Menifee-area Facebook groups (Menifee Community, Sun City CA residents groups).
- Ask the Menifee Union School District if they will link the food resource page from their family resources page.
- Ask the Kay Ceniceros Senior Center if they will add a link or QR code to the senior resource page.
- Ask cityofmenifee.us if they will add the pages to their community resources section.

Then watch the report-a-problem email (pennersteven@gmail.com) for corrections. Wrong-door reports mean the page reached someone. Fix what they report and it becomes more accurate.
