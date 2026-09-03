const SOURCE_URL = "https://us.sneakersnstuff.com/collections/upcoming-releases/";
const PRODUCTS_URL = "https://us.sneakersnstuff.com/collections/upcoming-releases/products.json";

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "See official source";
  return `$${amount.toFixed(amount % 1 ? 2 : 0)}`;
}

function isResaleCandidate(product) {
  const tags = (product.tags || []).map((tag) => tag.toLowerCase());
  const type = String(product.product_type || "").toLowerCase();
  const text = `${product.vendor || ""} ${product.title || ""} ${product.handle || ""}`.toLowerCase();

  return tags.includes("limited") &&
    tags.includes("upcoming") &&
    type.includes("sneaker") &&
    /(adidas|asics|jordan|new balance|nike|puma|salomon|saucony|vans|yeezy)/i.test(text);
}

export async function scrapeSnsUpcoming(fetchImpl = fetch) {
  const response = await fetchImpl(PRODUCTS_URL, {
    headers: {
      "accept": "application/json",
      "user-agent": "AccessListBot/0.1 (+https://rogerlink.com/access-list/)"
    }
  });

  if (!response.ok) {
    throw new Error(`SNS upcoming releases fetch failed: ${response.status}`);
  }

  const payload = await response.json();
  const products = Array.isArray(payload.products) ? payload.products : [];
  const verifiedAt = new Date().toISOString().slice(0, 10);

  return products
    .filter(isResaleCandidate)
    .map((product) => {
      const title = decodeHtml(`${product.vendor || ""} ${product.title || ""}`.trim());
      const officialSource = new URL(`/products/${product.handle}`, "https://us.sneakersnstuff.com").toString();

      return {
        id: `sns-${slug(product.handle || title)}`,
        title,
        category: "Sneakers",
        accessType: "First-come access",
        status: "Auto-imported",
        region: "US",
        price: formatPrice(product.variants?.[0]?.price),
        opens: "See official source",
        closes: "See official source",
        officialSource,
        sourceName: "SNS Upcoming Releases",
        sourceReliability: "official",
        scrapeStatus: "scrape",
        resalePotential: "Active resale market",
        resalePolicy: "Retailer terms may restrict purchase-for-resale",
        lastVerified: verifiedAt,
        summary: "Auto-imported from Sneakersnstuff upcoming releases. Limited sneaker release with active secondary-market potential; verify release timing and purchase terms at the official source."
      };
    });
}
