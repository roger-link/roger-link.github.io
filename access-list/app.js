let opportunities = [];

const els = {
  grid: document.querySelector("#opportunityGrid"),
  search: document.querySelector("#searchInput"),
  category: document.querySelector("#categoryFilter"),
  type: document.querySelector("#typeFilter"),
  region: document.querySelector("#regionFilter"),
  count: document.querySelector("#resultCount"),
  reset: document.querySelector("#resetFilters")
};

const normalize = (value) => String(value || "").toLowerCase();

function slug(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function uniqueOptions(key) {
  return [...new Set(opportunities.map((item) => item[key]).filter(Boolean))].sort();
}

function fillSelect(select, values) {
  select.querySelectorAll("option:not([value='all'])").forEach((option) => option.remove());

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function matchesFilters(item) {
  const search = normalize(els.search.value);
  const searchable = normalize([
    item.title,
    item.category,
    item.accessType,
    item.region,
    item.summary,
    item.status
  ].join(" "));

  return (!search || searchable.includes(search)) &&
    (els.category.value === "all" || item.category === els.category.value) &&
    (els.type.value === "all" || item.accessType === els.type.value) &&
    (els.region.value === "all" || item.region === els.region.value);
}

function pillClass(type) {
  if (type === "Purchase lottery") return "purchase";
  if (type === "Prize giveaway") return "giveaway";
  if (type === "Waitlist") return "waitlist";
  if (type === "Reservation") return "reservation";
  if (type === "First-come access") return "first-come";
  return "neutral";
}

function cardTemplate(item) {
  return `
    <article class="opportunity-card">
      <div class="card-top ${slug(item.category)}" aria-hidden="true"></div>
      <div class="card-body">
        <div class="card-meta">
          <span class="pill ${pillClass(item.accessType)}">${item.accessType}</span>
          <span class="pill neutral">${item.category}</span>
          <span class="pill neutral">${item.status}</span>
        </div>
        <h3>${item.title}</h3>
        <p class="card-summary">${item.summary}</p>
        <div class="details">
          <div class="detail"><span>Region</span><strong>${item.region}</strong></div>
          <div class="detail"><span>Price</span><strong>${item.price}</strong></div>
          <div class="detail"><span>Opens</span><strong>${item.opens}</strong></div>
          <div class="detail"><span>Closes</span><strong>${item.closes}</strong></div>
        </div>
        <a class="source-link" href="${item.officialSource}" target="_blank" rel="noopener">Official source</a>
      </div>
    </article>
  `;
}

function render() {
  const filtered = opportunities.filter(matchesFilters);
  els.count.textContent = `Showing ${filtered.length} of ${opportunities.length} opportunities`;

  if (!filtered.length) {
    els.grid.innerHTML = `<div class="empty-state">No matching opportunities. Try another category, region, access type, or search term.</div>`;
    return;
  }

  els.grid.innerHTML = filtered.map(cardTemplate).join("");
}

function resetFilters() {
  els.search.value = "";
  els.category.value = "all";
  els.type.value = "all";
  els.region.value = "all";
  render();
}

[els.search, els.category, els.type, els.region].forEach((el) => {
  el.addEventListener("input", render);
});

els.reset.addEventListener("click", resetFilters);

async function loadOpportunities() {
  try {
    const response = await fetch("data/opportunities.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Could not load opportunities: ${response.status}`);
    }

    opportunities = await response.json();

    fillSelect(els.category, uniqueOptions("category"));
    fillSelect(els.type, uniqueOptions("accessType"));
    fillSelect(els.region, uniqueOptions("region"));
    render();
  } catch (error) {
    els.count.textContent = "Could not load opportunities";
    els.grid.innerHTML = `<div class="empty-state">Opportunity data is unavailable right now. Check the data file and try again.</div>`;
    console.error(error);
  }
}

loadOpportunities();
