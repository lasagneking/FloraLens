const PLANTNET_BASE = "https://my-api.plantnet.org/v2/identify/all";
const TREFLE_BASE = "https://trefle.io/api/v1";
const GBIF_BASE = "https://api.gbif.org/v1";
const PERENUAL_BASE = "https://www.perenual.com/api/v2";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/check") {
      const target =
        "https://my-api.plantnet.org/v2/quota?api-key=" +
        encodeURIComponent(env.PLANTNET_API_KEY);

      const response = await fetch(target);
      return new Response(await response.text(), {
        status: response.status,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/enrich" && request.method === "GET") {
      const name = (url.searchParams.get("name") || "").trim();
      if (!name) return json({ error: "Scientific name required" }, 400, cors);

      const result = {
        scientificName: name,
        gbif: null,
        trefle: null,
        sources: []
      };

      // GBIF: public/no secret required.
      try {
        const matchURL = `${GBIF_BASE}/species/match?name=${encodeURIComponent(name)}`;
        const matchRes = await fetch(matchURL);
        if (matchRes.ok) {
          const match = await matchRes.json();
          if (match?.usageKey || match?.speciesKey) {
            const key = match.usageKey || match.speciesKey;
            const [profileRes, descRes, vernRes] = await Promise.all([
              fetch(`${GBIF_BASE}/species/${key}/speciesProfiles`),
              fetch(`${GBIF_BASE}/species/${key}/descriptions`),
              fetch(`${GBIF_BASE}/species/${key}/vernacularNames`)
            ]);
            const profiles = profileRes.ok ? await profileRes.json() : [];
            const descriptions = descRes.ok ? await descRes.json() : [];
            const vernacular = vernRes.ok ? await vernRes.json() : [];
            result.gbif = {
              key,
              canonicalName: match.canonicalName || match.scientificName || name,
              rank: match.rank || null,
              family: match.family || null,
              genus: match.genus || null,
              status: match.status || null,
              profiles,
              descriptions: Array.isArray(descriptions) ? descriptions.slice(0, 5) : [],
              vernacular: Array.isArray(vernacular) ? vernacular.slice(0, 20) : []
            };
            result.sources.push("GBIF");
          }
        }
      } catch (e) {
        result.gbifError = String(e?.message || e);
      }

      // Perenual: optional richer horticultural fallback.
      // Add PERENUAL_API_KEY as a Worker secret to enable it.
      if (env.PERENUAL_API_KEY) {
        try {
          const searchURL =
            `${PERENUAL_BASE}/species-list?key=${encodeURIComponent(env.PERENUAL_API_KEY)}` +
            `&q=${encodeURIComponent(name)}`;
          const searchRes = await fetch(searchURL);

          if (searchRes.ok) {
            const found = await searchRes.json();
            const rows = Array.isArray(found?.data) ? found.data : [];
            const lower = name.toLowerCase();

            const exact = rows.find(x =>
              Array.isArray(x.scientific_name) &&
              x.scientific_name.some(n => String(n).toLowerCase() === lower)
            );
            const best = exact || rows[0];

            if (best?.id) {
              // IMPORTANT: use the free species-list result directly.
              // Perenual's free plan can return 429 for the separate details
              // endpoint on species outside its free detail-data range.
              // The list result already contains useful fields such as
              // watering, sunlight and cycle, so do not immediately make a
              // second paid/gated request.
              result.perenual = normalizePerenual(best);
              result.perenual.mode = "species-list";
              result.sources.push("Perenual");
            } else {
              result.perenualStatus = "no-match";
            }
          } else {
            result.perenualError = `Perenual search ${searchRes.status}`;
          }
        } catch (e) {
          result.perenualError = String(e?.message || e);
        }
      } else {
        result.perenualStatus = "not-configured";
      }

      // Trefle: optional. Add TREFLE_TOKEN as a Worker secret to enable care data.
      if (env.TREFLE_TOKEN) {
        try {
          const searchURL =
            `${TREFLE_BASE}/species/search?token=${encodeURIComponent(env.TREFLE_TOKEN)}` +
            `&q=${encodeURIComponent(name)}&limit=5`;
          const searchRes = await fetch(searchURL);
          if (searchRes.ok) {
            const found = await searchRes.json();
            const rows = Array.isArray(found?.data) ? found.data : [];
            const lower = name.toLowerCase();
            const best =
              rows.find(x => (x.scientific_name || "").toLowerCase() === lower) ||
              rows[0];

            if (best?.links?.self) {
              const sep = best.links.self.includes("?") ? "&" : "?";
              const detailURL =
                `https://trefle.io${best.links.self}${sep}token=${encodeURIComponent(env.TREFLE_TOKEN)}`;
              const detailRes = await fetch(detailURL);
              if (detailRes.ok) {
                const detail = (await detailRes.json())?.data || {};
                result.trefle = normalizeTrefle(detail);
                result.sources.push("Trefle");
              } else {
                result.trefleError = `Trefle detail ${detailRes.status}`;
              }
            }
          } else {
            result.trefleError = `Trefle search ${searchRes.status}`;
          }
        } catch (e) {
          result.trefleError = String(e?.message || e);
        }
      } else {
        result.trefleStatus = "not-configured";
      }

      return json(result, 200, cors);
    }

    if (url.pathname !== "/identify" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, cors);
    }

    if (!env.PLANTNET_API_KEY) {
      return json({ error: "PLANTNET_API_KEY is not configured" }, 500, cors);
    }

    try {
      const incoming = await request.formData();
      const images = incoming.getAll("images");
      const organs = incoming.getAll("organs");

      if (!images.length) {
        return json({ error: "No images received by FloraLens Worker" }, 400, cors);
      }

      const outgoing = new FormData();
      for (let i = 0; i < images.length; i++) {
        outgoing.append("images", images[i]);
        if (organs[i]) outgoing.append("organs", organs[i]);
      }

      const target = new URL(PLANTNET_BASE);
      target.searchParams.set("api-key", env.PLANTNET_API_KEY);
      target.searchParams.set("lang", "en");
      target.searchParams.set("nb-results", "5");

      const response = await fetch(target.toString(), {
        method: "POST",
        body: outgoing
      });

      const body = await response.text();
      console.log("PlantNet response:", response.status, body);

      return new Response(body, {
        status: response.status,
        headers: {
          ...cors,
          "Content-Type": response.headers.get("Content-Type") || "application/json"
        }
      });
    } catch (error) {
      console.error("FloraLens Worker error:", error);
      return json({
        error: "Worker proxy error",
        detail: String(error?.message || error)
      }, 500, cors);
    }
  }
};

function normalizePerenual(d) {
  const dims = d?.dimensions || {};
  const hardiness = d?.hardiness || {};
  return {
    id: d?.id || null,
    commonName: d?.common_name || null,
    scientificNames: Array.isArray(d?.scientific_name) ? d.scientific_name : (d?.scientific_name ? [d.scientific_name] : []),
    family: d?.family || null,
    type: d?.type || null,
    cycle: d?.cycle || null,
    watering: d?.watering || null,
    wateringGeneralBenchmark: d?.watering_general_benchmark || null,
    sunlight: Array.isArray(d?.sunlight) ? d.sunlight : (d?.sunlight ? [d.sunlight] : []),
    soil: Array.isArray(d?.soil) ? d.soil : (d?.soil ? [d.soil] : []),
    growthRate: d?.growth_rate || null,
    maintenance: d?.maintenance || null,
    careLevel: d?.care_level || null,
    floweringSeason: d?.flowering_season || null,
    droughtTolerant: typeof d?.drought_tolerant === "boolean" ? d.drought_tolerant : null,
    saltTolerant: typeof d?.salt_tolerant === "boolean" ? d.salt_tolerant : null,
    thorny: typeof d?.thorny === "boolean" ? d.thorny : null,
    invasive: typeof d?.invasive === "boolean" ? d.invasive : null,
    poisonousToHumans: typeof d?.poisonous_to_humans === "boolean" ? d.poisonous_to_humans : null,
    poisonousToPets: typeof d?.poisonous_to_pets === "boolean" ? d.poisonous_to_pets : null,
    dimensionMin: typeof dims?.min_value === "number" ? dims.min_value : null,
    dimensionMax: typeof dims?.max_value === "number" ? dims.max_value : null,
    dimensionUnit: dims?.unit || null,
    hardinessMin: hardiness?.min ?? null,
    hardinessMax: hardiness?.max ?? null,
    description: d?.description || null
  };
}

function normalizeTrefle(d) {
  const g = d.growth || {};
  const s = d.specifications || {};
  return {
    trefleId: d.id || null,
    scientificName: d.scientific_name || null,
    commonName: d.common_name || null,
    family: d.family || null,
    genus: d.genus || null,
    duration: d.duration || [],
    observations: d.observations || null,
    edible: typeof d.edible === "boolean" ? d.edible : null,
    ediblePart: d.edible_part || [],
    flowerColors: d.flower?.color || [],
    foliageColors: d.foliage?.color || [],
    leafRetention: typeof d.foliage?.leaf_retention === "boolean" ? d.foliage.leaf_retention : null,
    growthHabit: s.growth_habit || null,
    growthForm: s.growth_form || null,
    growthRate: s.growth_rate || null,
    toxicity: s.toxicity || null,
    averageHeightCm: valueOf(s.average_height),
    maximumHeightCm: valueOf(s.maximum_height),
    light: numberOrNull(g.light),
    atmosphericHumidity: numberOrNull(g.atmospheric_humidity),
    soilHumidity: numberOrNull(g.soil_humidity),
    soilNutrients: numberOrNull(g.soil_nutriments),
    soilTexture: numberOrNull(g.soil_texture),
    soilSalinity: numberOrNull(g.soil_salinity),
    phMinimum: numberOrNull(g.ph_minimum),
    phMaximum: numberOrNull(g.ph_maximum),
    spreadCm: valueOf(g.spread),
    minimumTemperatureC: unitValue(g.minimum_temperature, "c"),
    maximumTemperatureC: unitValue(g.maximum_temperature, "c"),
    bloomMonths: g.bloom_months || [],
    growthMonths: g.growth_months || [],
    fruitMonths: g.fruit_months || [],
    growthDescription: g.description || null,
    sowing: g.sowing || null,
    sources: (d.sources || []).slice(0, 8).map(x => ({
      name: x.name || null,
      citation: x.citation || null,
      url: x.url || null,
      lastUpdate: x.last_update || null
    }))
  };
}

function numberOrNull(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function valueOf(o) {
  if (!o) return null;
  if (typeof o === "number") return o;
  if (typeof o.cm === "number") return o.cm;
  if (typeof o.value === "number") return o.value;
  return null;
}
function unitValue(o, unit) {
  if (!o) return null;
  if (typeof o === "number") return o;
  if (typeof o[unit] === "number") return o[unit];
  return typeof o.celsius === "number" ? o.celsius : null;
}
function json(value, status, headers) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...headers, "Content-Type": "application/json" }
  });
}
