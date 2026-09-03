import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeNikeLaunch } from "./scrape-nike.mjs";
import { scrapeSnsUpcoming } from "./scrape-sns.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, "../data");
const candidatesPath = resolve(dataDir, "candidates.json");
const opportunitiesPath = resolve(dataDir, "opportunities.json");

function mergeCandidates(existing, incoming) {
  const incomingSources = new Set(incoming.map((item) => item.sourceName));
  const retained = existing.filter((item) => !incomingSources.has(item.sourceName));
  const bySource = new Map(retained.map((item) => [item.officialSource, item]));

  for (const item of incoming) {
    bySource.set(item.officialSource, {
      ...bySource.get(item.officialSource),
      ...item
    });
  }

  return [...bySource.values()].sort((a, b) => {
    const sourceCompare = a.sourceName.localeCompare(b.sourceName);
    return sourceCompare || a.title.localeCompare(b.title);
  });
}

async function runScraper(name, scraper) {
  try {
    const results = await scraper();
    console.log(`${name}: ${results.length} candidates`);
    return results;
  } catch (error) {
    console.warn(`${name}: skipped after error`);
    console.warn(error.message);
    return [];
  }
}

async function main() {
  const incoming = [
    ...await runScraper("Nike", scrapeNikeLaunch),
    ...await runScraper("SNS", scrapeSnsUpcoming)
  ];
  const candidates = mergeCandidates([], incoming);
  const published = mergeCandidates([], incoming);

  await mkdir(dataDir, { recursive: true });
  await writeFile(candidatesPath, `${JSON.stringify(candidates, null, 2)}\n`);
  await writeFile(opportunitiesPath, `${JSON.stringify(published, null, 2)}\n`);

  console.log(`Wrote ${candidates.length} candidates to ${candidatesPath}`);
  console.log(`Published ${published.length} opportunities to ${opportunitiesPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
