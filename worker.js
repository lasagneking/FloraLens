/* FloraLens Worker
   /identify  Pl@ntNet identification       /enrich   GBIF + Perenual + Trefle
   /check     Pl@ntNet quota                 /doctor   Plant Doctor (Gemini)
   /fill      Gemini gap-filler              /buycheck "Should I buy it?" (Gemini)
   Secrets: PLANTNET_API_KEY, PERENUAL_API_KEY, TREFLE_TOKEN, GEMINI_API_KEY */

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

    // Gemini: Plant Doctor, gap-filling and "Should I buy it?"
    if (url.pathname === "/doctor" || url.pathname === "/fill" || url.pathname === "/buycheck") {
      try {
        if (url.pathname === "/doctor") return await handleDoctor(request, env, cors);
        if (url.pathname === "/fill") return await handleFill(request, env, cors);
        return await handleBuyCheck(request, env, cors);
      } catch (error) {
        console.error("FloraLens Gemini route error:", error);
        return json({ error: "Worker error talking to Gemini", detail: String(error?.message || error) }, 500, cors);
      }
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

/* ============================== GEMINI ============================== */

const GEMINI_MODEL = "gemini-3.8-flash";

// The web address(es) FloraLens is served from, e.g. "https://floralens.pages.dev".
// Leave the list empty to allow any origin (not recommended on the free tier).
const ALLOWED_ORIGINS = [
  "https://lasagneking.github.io",
];

const DOCTOR_RULES = `You are FloraLens Plant Doctor, an experienced, calm UK gardener helping a home gardener in the UK.
You receive photos of one plant, what the app knows about it (species, where it grows, its care record, recent journal notes) and, optionally, her own note.

How to answer:
- Fill in the JSON template exactly. Plain, friendly British English. No jargon without a short explanation.
- Base the verdict on what is visible in the photos. Use the care record, month and journal as supporting evidence and say so in "why" when they matter (e.g. "after the wet September you logged").
- Consider every kind of cause, not only disease: pests, over or under watering, drainage, nutrients, frost, scorch, wind, transplant shock, pot-bound roots, and normal seasonal changes such as autumn leaf drop or dormancy.
- If the plant looks healthy, say so plainly (status "healthy", seriousness 0) and give a couple of things to keep doing.
- If the photos are too blurry, dark, distant or don't show the problem, use status "unclear", verdict "Can't tell from these photos", and explain exactly what photo to take in "photo_tip".
- Never sound more certain than the photos allow. "likely" only when the signs are clear and specific; otherwise "possible" or "unsure".
- Advice: cultural and hand remedies first (remove affected growth, improve airflow, adjust watering). Mention a chemical only as a last resort, describe the type rather than a brand, tell her to follow the label, and put any pet, child or wildlife caution in "safety_note".
- Keep it short: each list item one sentence, under 20 words. do_now 2 to 4 items. avoid 0 to 2 items.
- quick_checks: 1 to 3 yes/no questions she can answer by looking at the plant, chosen to tell your top possibilities apart. Empty if you're already sure.
- could_also_be: up to 3 alternatives with likelihood "higher", "medium", "lower" or "ruled_out", each with a short note. If one of her answers rules something out, keep it in the list as "ruled_out" and say which answer did it.
- follow_up_questions: 2 or 3 short questions (under 8 words) she would naturally ask next.
- recheck_in_days: 0 if healthy, otherwise 3 to 14.

When "Her answers" are provided: use them to update the whole result; don't ask the same quick checks again.
When "Her question" is provided: answer it directly in "answer" (2 to 4 sentences, specific to this plant and these photos), keep the rest of the result consistent with the previous result unless the question reveals something new.`;

const DOCTOR_SCHEMA = {
  type: "object",
  properties: {
    verdict:       { type: "string", description: "Short name of the most likely problem, e.g. 'Black spot', or 'Looks healthy' / 'Can't tell from these photos'" },
    subtitle:      { type: "string", description: "Short descriptor, e.g. 'Fungal disease · very common on roses'" },
    status:        { type: "string", enum: ["healthy", "watch", "act", "unclear"] },
    confidence:    { type: "string", enum: ["likely", "possible", "unsure"] },
    seriousness:   { type: "integer", description: "0 none, 1 minor, 2 moderate, 3 serious" },
    why:           { type: "string", description: "One or two sentences explaining the reasoning" },
    photo_tip:     { type: "string", description: "Only if a better photo is needed; otherwise empty" },
    quick_checks:  { type: "array", items: { type: "string" } },
    do_now:        { type: "array", items: { type: "string" } },
    effort:        { type: "string", description: "e.g. 'Takes about 15 minutes'; empty if not useful" },
    avoid:         { type: "array", items: { type: "string" } },
    could_also_be: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name:       { type: "string" },
          likelihood: { type: "string", enum: ["higher", "medium", "lower", "ruled_out"] },
          note:       { type: "string" }
        },
        required: ["name", "likelihood", "note"]
      }
    },
    next_season:   { type: "string", description: "One prevention tip for the future; empty if not useful" },
    safety_note:   { type: "string", description: "Pet, child or wildlife caution if any treatment needs one; otherwise empty" },
    recheck_in_days: { type: "integer" },
    follow_up_questions: { type: "array", items: { type: "string" } },
    answer:        { type: "string", description: "Direct answer to her question, only when a question was asked; otherwise empty" }
  },
  required: ["verdict", "status", "confidence", "seriousness", "why", "quick_checks", "do_now", "avoid", "could_also_be", "recheck_in_days", "follow_up_questions"]
};

function doctorJson(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callGemini(env, { system, input, schema }) {
  const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      system_instruction: system,
      input,
      response_format: { type: "text", mime_type: "application/json", schema },
      store: false,
    }),
  });
  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.log("Gemini error", upstream.status, detail.slice(0, 500));
    return { status: upstream.status === 429 ? 429 : 502, error: upstream.status === 429 ? "Gemini quota reached" : `Gemini returned an error (${upstream.status}).` };
  }
  const data = await upstream.json();
  const text = extractGeminiText(data).trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  try { return { result: JSON.parse(text) }; }
  catch { console.log("Unparseable Gemini output", text.slice(0, 500)); return { status: 502, error: "Gemini's answer couldn't be read. Try again." }; }
}

function originAllowed(request) {
  const origin = request.headers.get("Origin") || "";
  return !ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin);
}

function extractGeminiText(data) {
  if (typeof data?.output_text === "string") return data.output_text;
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i];
    if (s?.type === "model_output" && Array.isArray(s.content)) {
      const t = s.content.filter(c => c?.type === "text" && typeof c.text === "string").map(c => c.text).join("");
      if (t) return t;
    }
  }
  if (Array.isArray(data?.outputs)) {
    const t = data.outputs.map(o => o?.text || "").join("");
    if (t) return t;
  }
  return "";
}

async function handleDoctor(request, env, corsHeaders) {
  if (request.method !== "POST") return doctorJson({ error: "Use POST" }, 405, corsHeaders);

  if (!originAllowed(request)) return doctorJson({ error: "Origin not allowed" }, 403, corsHeaders);
  if (!env.GEMINI_API_KEY) return doctorJson({ error: "GEMINI_API_KEY is not set on the Worker." }, 500, corsHeaders);

  let body;
  try { body = await request.json(); } catch { return doctorJson({ error: "Bad request" }, 400, corsHeaders); }

  const images = (Array.isArray(body.images) ? body.images : []).slice(0, 3)
    .filter(i => i && typeof i.data === "string" && /^image\/(jpeg|png|webp)$/.test(i.mime_type || ""));
  if (!images.length) return doctorJson({ error: "No photo received." }, 400, corsHeaders);

  const clip = (s, n) => String(s || "").slice(0, n);
  const parts = [`What FloraLens knows:\n${clip(body.context, 4000)}`];
  if (body.note) parts.push(`Her note: ${clip(body.note, 400)}`);
  if (Array.isArray(body.answers) && body.answers.length) {
    parts.push("Her answers to your quick checks:\n" + body.answers.slice(0, 6).map(a => `- ${clip(a.q, 200)} → ${clip(a.a, 20)}`).join("\n"));
  }
  if (body.previous) parts.push(`Your previous result for these photos:\n${clip(JSON.stringify(body.previous), 4000)}`);
  if (Array.isArray(body.history) && body.history.length) {
    parts.push("Earlier questions in this check:\n" + body.history.slice(-4).map(t => `Q: ${clip(t.q, 300)}\nA: ${clip(t.a, 800)}`).join("\n"));
  }
  if (body.question) parts.push(`Her question: ${clip(body.question, 300)}`);
  parts.push("Return the JSON result.");

  const out = await callGemini(env, {
    system: DOCTOR_RULES,
    schema: DOCTOR_SCHEMA,
    input: [
      ...images.map(i => ({ type: "image", data: i.data, mime_type: i.mime_type })),
      { type: "text", text: parts.join("\n\n") },
    ],
  });
  if (out.error) return doctorJson({ error: out.error }, out.status, corsHeaders);
  return doctorJson({ result: out.result }, 200, corsHeaders);
}

/* ------------------------------------------------------------------ /fill */

const FILL_RULES = `You are a careful UK horticulture reference, writing for a home gardener in the UK.
You are given one plant species, the care facts FloraLens already has from botanical databases, and a list of fields that are missing.
Fill ONLY the missing fields, for this exact species, as grown in UK gardens or homes.

- Be practical and specific, in the style of RHS guidance. One or two sentences per field, plain British English, metric units.
- Stay consistent with the known facts you are given.
- If something varies a lot by cultivar or you are not confident for this species, say so briefly in the text ("varies by cultivar; most…").
- If you genuinely don't know, return an empty string (or an empty list for bloomMonths). Never invent.

Field formats:
- light: e.g. "Full sun to partial shade."
- water: how and when to water, including any winter difference.
- soil: soil type, drainage and pH preference; compost type for pot or houseplants.
- height: typical eventual height and spread, e.g. "Typically 60–90 cm tall and 60 cm wide."
- hardiness: include the RHS hardiness rating if known, e.g. "Hardy (RHS H5); survives most UK winters." For houseplants give the minimum temperature.
- growthHabit: e.g. "Deciduous shrub", "Evergreen climbing perennial", "Tender houseplant".
- growthRate: "Slow", "Moderate" or "Fast", with a few words if useful.
- pruning: ALWAYS state the timing using month or season words, e.g. "Prune in late winter or early spring…", "Prune after flowering…", or say it needs little pruning.
- propagation: methods and the best time of year.
- safety: toxicity to people, cats and dogs. Say "No known toxicity to people or pets." only if confident.
- bloomMonths: month numbers (1–12) when it usually flowers in the UK. Empty list if it isn't normally grown for flowers or rarely flowers in cultivation.
- description: two or three sentences: what the plant is, where it comes from, and why gardeners grow it.`;

const FILL_FIELD_SCHEMA = {
  light: { type: "string" }, water: { type: "string" }, soil: { type: "string" },
  height: { type: "string" }, hardiness: { type: "string" }, growthHabit: { type: "string" },
  growthRate: { type: "string" }, pruning: { type: "string" }, propagation: { type: "string" },
  safety: { type: "string" }, description: { type: "string" },
  bloomMonths: { type: "array", items: { type: "integer" } },
};

async function handleFill(request, env, corsHeaders) {
  if (request.method !== "POST") return doctorJson({ error: "Use POST" }, 405, corsHeaders);
  if (!originAllowed(request)) return doctorJson({ error: "Origin not allowed" }, 403, corsHeaders);
  if (!env.GEMINI_API_KEY) return doctorJson({ error: "GEMINI_API_KEY is not set on the Worker." }, 500, corsHeaders);

  let body;
  try { body = await request.json(); } catch { return doctorJson({ error: "Bad request" }, 400, corsHeaders); }
  const clip = (s, n) => String(s || "").slice(0, n);
  const missing = (Array.isArray(body.missing) ? body.missing : []).filter(k => k in FILL_FIELD_SCHEMA);
  if (!body.scientific || !missing.length) return doctorJson({ error: "Nothing to fill" }, 400, corsHeaders);

  const properties = Object.fromEntries(missing.map(k => [k, FILL_FIELD_SCHEMA[k]]));
  const known = body.known && typeof body.known === "object" ? body.known : {};
  const text = [
    `Species: ${clip(body.scientific, 120)}${body.common ? ` (${clip(body.common, 80)})` : ""}${body.family ? `, family ${clip(body.family, 60)}` : ""}`,
    Object.keys(known).length ? `Known facts:\n${Object.entries(known).map(([k, v]) => `- ${k}: ${clip(Array.isArray(v) ? v.join(", ") : v, 300)}`).join("\n")}` : "Known facts: none",
    `Missing fields to fill: ${missing.join(", ")}`,
  ].join("\n\n");

  const out = await callGemini(env, {
    system: FILL_RULES,
    schema: { type: "object", properties, required: missing },
    input: [{ type: "text", text }],
  });
  if (out.error) return doctorJson({ error: out.error }, out.status, corsHeaders);
  return doctorJson({ fields: out.result, model: GEMINI_MODEL }, 200, corsHeaders);
}

/* ------------------------------------------------------------------ /buycheck */

const BUY_RULES = `You are FloraLens, an experienced UK gardener standing next to a home gardener in a garden centre or nursery.
You are shown photos of ONE plant she is thinking of buying, plus what FloraLens knows about the species and today's date.
Judge this particular plant as a purchase, based only on what you can see. Be honest and specific, like a friend who knows plants.

Look for:
- Good signs: healthy, even leaf colour; bushy, compact growth with several shoots from the base; plenty of buds rather than all flowers fully open; firm, upright stems; clean compost.
- Warning signs: pests (aphids, whitefly, mealybug, scale, spider mite webbing, notched leaf edges from vine weevil); disease (spots, mildew, rust, mould, rot, black or mushy stems); yellowing or browning leaves; wilting; leggy or stretched growth; broken or damaged stems; roots growing out of the drainage holes or circling on the surface (pot-bound); moss, liverwort or weeds on the compost (old stock); very dry or waterlogged compost.

Ratings:
- "great": healthy and well grown, an easy yes.
- "good": fine to buy, maybe with a minor, fixable issue.
- "caution": real concerns; only buy if the checks come out well, or look for a better one on the bench.
- "avoid": pests, disease or damage likely to spread or not recover. Say plainly "I'd advise against buying this one" in the headline or summary.
- "unclear": the photos don't show enough (e.g. just a flower close-up, too dark or blurry). Say what photo to take in photo_tip.

Seasonal judgement: a perennial dying back in autumn, or a deciduous shrub without leaves in winter, can be perfectly healthy. Say so rather than marking it down. If the plant is tender and it's too cold to plant out, mention it in first_weeks.

Keep it short and friendly, in British English: headline under 12 words; summary 1–2 sentences; each list item one sentence under 18 words. positives and concerns 0–4 items each; check_in_store 1–3 quick checks she can do right now that the photo can't show (e.g. "Slide it out of the pot: roots should be pale and not tightly circling").`;

const BUY_SCHEMA = {
  type: "object",
  properties: {
    rating:         { type: "string", enum: ["great", "good", "caution", "avoid", "unclear"] },
    headline:       { type: "string" },
    summary:        { type: "string" },
    confidence:     { type: "string", enum: ["likely", "possible", "unsure"] },
    positives:      { type: "array", items: { type: "string" } },
    concerns:       { type: "array", items: { type: "string" } },
    check_in_store: { type: "array", items: { type: "string" } },
    first_weeks:    { type: "string", description: "One tip for the first few weeks after buying, given the month; empty if not useful" },
    photo_tip:      { type: "string", description: "Only when a better photo is needed; otherwise empty" }
  },
  required: ["rating", "headline", "summary", "confidence", "positives", "concerns", "check_in_store"]
};

async function handleBuyCheck(request, env, corsHeaders) {
  if (request.method !== "POST") return doctorJson({ error: "Use POST" }, 405, corsHeaders);
  if (!originAllowed(request)) return doctorJson({ error: "Origin not allowed" }, 403, corsHeaders);
  if (!env.GEMINI_API_KEY) return doctorJson({ error: "GEMINI_API_KEY is not set on the Worker." }, 500, corsHeaders);

  let body;
  try { body = await request.json(); } catch { return doctorJson({ error: "Bad request" }, 400, corsHeaders); }
  const images = (Array.isArray(body.images) ? body.images : []).slice(0, 3)
    .filter(i => i && typeof i.data === "string" && /^image\/(jpeg|png|webp)$/.test(i.mime_type || ""));
  if (!images.length) return doctorJson({ error: "No photo received." }, 400, corsHeaders);

  const out = await callGemini(env, {
    system: BUY_RULES,
    schema: BUY_SCHEMA,
    input: [
      ...images.map(i => ({ type: "image", data: i.data, mime_type: i.mime_type })),
      { type: "text", text: `What FloraLens knows:\n${String(body.context || "").slice(0, 3000)}\n\nShould she buy this plant? Return the JSON result.` },
    ],
  });
  if (out.error) return doctorJson({ error: out.error }, out.status, corsHeaders);
  return doctorJson({ result: out.result }, 200, corsHeaders);
}
