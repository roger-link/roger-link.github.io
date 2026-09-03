const SOURCE_URL = "https://hamiltonmusical.com/new-york/tickets/#lottery";
const FETCH_URL = "https://hamiltonmusical.com/new-york/tickets/";

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

function findLotteryWindow(text) {
  const match = text.match(/The lottery will open at .*?following week's performances\./i);
  return match ? match[0] : "Weekly lottery; confirm current timing at the official source";
}

export async function scrapeHamiltonLottery(fetchImpl = fetch) {
  const response = await fetchImpl(FETCH_URL, {
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent": "AccessListBot/0.1 (+https://rogerlink.com/access-list/)"
    }
  });

  if (!response.ok) {
    throw new Error(`Hamilton ticket page fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const text = cleanText(html);

  if (!/Ham4Ham Lottery/i.test(text) && !/Ham\s*4\s*Ham Lottery/i.test(text)) {
    return [];
  }

  const priceMatch = text.match(/\$10 tickets are available/i);
  const windowText = findLotteryWindow(text);
  const verifiedAt = new Date().toISOString().slice(0, 10);

  return [
    {
      id: "hamilton-new-york-ham4ham-lottery",
      title: "Hamilton New York Ham4Ham Lottery",
      category: "Theater",
      accessType: "Purchase lottery",
      status: "Auto-imported",
      region: "New York, US",
      price: priceMatch ? "$10 tickets" : "Discounted lottery tickets",
      opens: windowText,
      closes: "See official source",
      officialSource: SOURCE_URL,
      sourceName: "Hamilton New York Tickets",
      sourceReliability: "official",
      scrapeStatus: "scrape",
      lastVerified: verifiedAt,
      summary: "Official Hamilton lottery listing for the chance to buy limited Broadway tickets at the posted lottery price."
    }
  ];
}
