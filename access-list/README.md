# Access List

A simple GitHub Pages MVP for a directory of free-entry lotteries, ballots, drawings, reservations, waitlists, and first-come releases that provide access to buy scarce tickets or products at retail or face value.

## Edit approved listings

Approved listings live in `data/opportunities.json`.

Each listing supports:

- `title`
- `category`
- `accessType`
- `status`
- `region`
- `price`
- `opens`
- `closes`
- `officialSource`
- `summary`

Keep the distinction clear:

- `Purchase lottery`: free entry selects users who can buy at retail or face value.
- `Prize giveaway`: free entry may award a prize; this is labeled separately and is not the core directory focus.
- `Waitlist`: users join a queue or interest list for future purchase access.
- `Reservation`: users reserve purchase access for a future release.
- `First-come access`: inventory opens at a known time without a random drawing.

## GitHub Pages

This site is static and has no build step. Deploy from the repository root on the `main` branch.

## Scope rules

- Avoid paid-entry gambling.
- Prefer official sources.
- Do not imply users will win or receive a product for free.
- Verify current dates, eligibility, pricing, and terms before publishing live listings.

## Scraper updates

Scraper output lives in `data/candidates.json`. The scraper also publishes auto-imported entries into `data/opportunities.json`, which means those entries appear on the public page without manual review.

Run all scrapers locally with:

```sh
node scripts/scrape-all.mjs
```

GitHub Actions also runs the scraper workflow weekly and commits changes when `data/candidates.json` or `data/opportunities.json` changes.

Current scraper sources:

- Hamilton New York Tickets
- Nike SNKRS Launch Calendar
