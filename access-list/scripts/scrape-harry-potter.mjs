const SOURCE_URL = "https://broadway.harrypottertheplay.com/friday-forty/";

function cleanText(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function findWindow(text) {
  const match = text.match(/You can enter any Monday .*? EST\./i);
  return match ? match[0] : "Weekly Friday Forty lottery; confirm current timing at the official source";
}

export async function scrapeHarryPotterLottery(fetchImpl = fetch) {
  const response = await fetchImpl(SOURCE_URL, {
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent": "AccessListBot/0.1 (+https://rogerlink.com/access-list/)"
    }
  });

  if (!response.ok) {
    throw new Error(`Harry Potter Friday Forty page fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const text = cleanText(html);

  if (!/Friday Forty/i.test(text) || !/TodayTix/i.test(text)) {
    return [];
  }

  const priceMatch = text.match(/\$40(?:\s+Harry Potter and the Cursed Child)? tickets/i);
  const verifiedAt = new Date().toISOString().slice(0, 10);

  return [
    {
      id: "harry-potter-broadway-friday-forty",
      title: "Harry Potter and the Cursed Child Friday Forty",
      category: "Theater",
      accessType: "Purchase lottery",
      status: "Auto-imported",
      region: "New York, US",
      price: priceMatch ? "$40 tickets" : "Discounted lottery tickets",
      opens: findWindow(text),
      closes: "Friday 1:00 PM ET",
      officialSource: SOURCE_URL,
      sourceName: "Harry Potter Broadway Friday Forty",
      sourceReliability: "official",
      scrapeStatus: "scrape",
      lastVerified: verifiedAt,
      summary: "Official Broadway Friday Forty listing for the chance to buy a limited number of discounted Harry Potter and the Cursed Child tickets."
    }
  ];
}
