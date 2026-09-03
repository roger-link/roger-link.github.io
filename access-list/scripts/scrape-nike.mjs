const SOURCE_URL = "https://www.nike.com/launch";

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(value) {
  return decodeHtml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function titleFromPath(path) {
  const slug = path.split("/").filter(Boolean).pop() || "";
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .filter(Boolean)
    .map((word) => {
      if (word === "fc") return "FC";
      if (word === "og") return "OG";
      if (word === "x") return "x";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function classifyAccessType(text) {
  const normalized = text.toLowerCase();

  if (normalized.includes("draw")) return "Purchase lottery";
  if (normalized.includes("exclusive access")) return "Exclusive access";

  return "Needs review";
}

export async function scrapeNikeLaunch(fetchImpl = fetch) {
  const response = await fetchImpl(SOURCE_URL, {
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent": "AccessListBot/0.1 (+https://rogerlink.com/access-list/)"
    }
  });

  if (!response.ok) {
    throw new Error(`Nike launch fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const productPathPattern = /\/launch\/t\/[a-zA-Z0-9_./-]+/g;
  const candidates = [];
  const verifiedAt = new Date().toISOString().slice(0, 10);

  for (const match of html.matchAll(productPathPattern)) {
    const path = match[0].replace(/\/$/, "");
    const officialSource = new URL(path, "https://www.nike.com").toString();
    const title = titleFromPath(path);

    candidates.push({
      id: `nike-${officialSource.split("/").filter(Boolean).pop()}`,
      title,
      category: "Sneakers",
      accessType: classifyAccessType(html.slice(Math.max(0, match.index - 500), match.index + 500)),
      status: "Auto-imported",
      region: "US",
      price: "Needs review",
      opens: "Needs review",
      closes: "Needs review",
      officialSource,
      sourceName: "Nike SNKRS Launch Calendar",
      sourceReliability: "official",
      scrapeStatus: "scrape",
      resalePotential: "Active resale market",
      resalePolicy: "Purchase-for-resale may be restricted",
      lastVerified: verifiedAt,
      summary: "Auto-imported from Nike SNKRS launch calendar. Product page may contain retail price, launch date, and access mechanic details."
    });
  }

  return uniqueBy(candidates, (item) => item.officialSource)
    .sort((a, b) => a.title.localeCompare(b.title));
}
