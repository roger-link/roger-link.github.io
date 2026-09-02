import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeNikeLaunch } from "./scrape-nike.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, "../data");
const candidatesPath = resolve(dataDir, "candidates.json");
const opportunitiesPath = resolve(dataDir, "opportunities.json");

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

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

function publishAutoImports(opportunities, incoming) {
  const incomingSources = new Set(incoming.map((item) => item.sourceName));
  const retained = opportunities.filter((item) => {
    const sameSource = incomingSources.has(item.sourceName);
    return !(sameSource && item.status === "Auto-imported");
  });

  return mergeCandidates(retained, incoming);
}

async function main() {
  const existing = await readJson(candidatesPath, []);
  const opportunities = await readJson(opportunitiesPath, []);
  const nikeCandidates = await scrapeNikeLaunch();
  const candidates = mergeCandidates(existing, nikeCandidates);
  const published = publishAutoImports(opportunities, nikeCandidates);

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
