const SOURCE_URL = "https://hadestownmusical.com/";

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

export async function scrapeHadestownLottery(fetchImpl = fetch) {
  const response = await fetchImpl(SOURCE_URL, {
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent": "AccessListBot/0.1 (+https://rogerlink.com/access-list/)"
    }
  });

  if (!response.ok) {
    throw new Error(`Hadestown page fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const text = cleanText(html);

  const luckySeatMatch = html.match(/href=["'](https:\/\/www\.luckyseat\.com\/shows\/hadestown-newyork)["']/i);

  if (!/DIGITAL LOTTERY/i.test(text) || !luckySeatMatch) {
    return [];
  }

  const priceMatch = text.match(/\$49(?:\.00)? tickets/i);
  const verifiedAt = new Date().toISOString().slice(0, 10);

  return [
    {
      id: "hadestown-broadway-digital-lottery",
      title: "Hadestown Broadway Digital Lottery",
      category: "Theater",
      accessType: "Purchase lottery",
      status: "Auto-imported",
      region: "New York, US",
      price: priceMatch ? "$49 tickets" : "Discounted lottery tickets",
      opens: "See official source",
      closes: "See official source",
      officialSource: SOURCE_URL,
      sourceName: "Hadestown Broadway Official Site",
      sourceReliability: "official",
      scrapeStatus: "scrape",
      lastVerified: verifiedAt,
      summary: `Official Hadestown Broadway listing for a digital lottery to buy limited discounted tickets${luckySeatMatch ? ` through Lucky Seat: ${luckySeatMatch[1]}` : ""}.`
    }
  ];
}
