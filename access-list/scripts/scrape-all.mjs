import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeNikeLaunch } from "./scrape-nike.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, "../data");
const candidatesPath = resolve(dataDir, "candidates.json");

async function readExistingCandidates() {
  try {
    return JSON.parse(await readFile(candidatesPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
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

async function main() {
  const existing = await readExistingCandidates();
  const nikeCandidates = await scrapeNikeLaunch();
  const candidates = mergeCandidates(existing, nikeCandidates);

  await mkdir(dataDir, { recursive: true });
  await writeFile(candidatesPath, `${JSON.stringify(candidates, null, 2)}\n`);

  console.log(`Wrote ${candidates.length} candidates to ${candidatesPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
