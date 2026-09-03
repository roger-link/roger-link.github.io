# Access List

A simple GitHub Pages MVP for a directory of free-entry lotteries, drawings, reservations, waitlists, and first-come releases that provide access to buy scarce products with active resale markets.

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
- `resalePotential`
- `resalePolicy`
- `summary`

Keep the distinction clear:

- `Purchase lottery`: free entry selects users who can buy scarce inventory at retail or face value.
- `Prize giveaway`: free entry may award a prize; this is out of scope for the public feed.
- `Waitlist`: users join a queue or interest list for future purchase access.
- `Reservation`: users reserve purchase access for a future release.
- `First-come access`: inventory opens at a known time without a random drawing.
- `Release calendar`: official launch listing where the exact purchase mechanic should be confirmed at the source.

## GitHub Pages

This site is static and has no build step. Deploy from the repository root on the `main` branch.

## Scope rules

- Avoid paid-entry gambling.
- Prefer official sources.
- Only publish listings with an active resale market.
- Exclude non-transferable access such as race entries and personal-use event lotteries.
- Flag known resale restrictions instead of hiding them.
- Do not imply users will win or receive a product for free.
- Verify current dates, eligibility, pricing, and terms before publishing live listings.

## Scraper updates

Scraper output lives in `data/candidates.json`. The scraper also publishes auto-imported entries into `data/opportunities.json`, which means those entries appear on the public page without manual review. Both files are regenerated from the current approved scraper set on every run.

Run all scrapers locally with:

```sh
node scripts/scrape-all.mjs
```

GitHub Actions also runs the scraper workflow weekly and commits changes when `data/candidates.json` or `data/opportunities.json` changes.

Current scraper sources:

- Nike SNKRS Launch Calendar
- SNS Upcoming Releases
