/**
 * FloraLens Pl@ntNet proxy — Cloudflare Worker
 *
 * Secret required:
 *   PLANTNET_API_KEY
 *
 * Route:
 *   POST /identify
 *
 * The browser sends images/organs as multipart FormData.
 * The private API key never reaches app.js.
 */

const PLANTNET_BASE = "https://my-api.plantnet.org/v2/identify/all";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname !== "/identify" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, cors);
    }

    if (!env.PLANTNET_API_KEY) {
      return json({ error: "PLANTNET_API_KEY secret is not configured" }, 500, cors);
    }

    try {
      const incoming = await request.formData();
      const outgoing = new FormData();

      const images = incoming.getAll("images");
      const organs = incoming.getAll("organs");

      if (!images.length || images.length > 5) {
        return json({ error: "Send between 1 and 5 images" }, 400, cors);
      }

      if (organs.length && organs.length !== images.length) {
        return json({ error: "Number of organs must match number of images" }, 400, cors);
      }

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (!(file instanceof File)) return json({ error: "Invalid image upload" }, 400, cors);
        if (!["image/jpeg", "image/png"].includes(file.type)) {
          return json({ error: "Only JPG and PNG are supported" }, 400, cors);
        }
        outgoing.append("images", file, file.name || `plant-${i+1}.jpg`);
        outgoing.append("organs", organs[i] || "auto");
      }

      const lang = String(incoming.get("lang") || "en");
      const nbResults = String(incoming.get("nb-results") || "5");

      const target = new URL(PLANTNET_BASE);
      target.searchParams.set("api-key", env.PLANTNET_API_KEY);
      target.searchParams.set("lang", lang);
      target.searchParams.set("nb-results", nbResults);

      const response = await fetch(target.toString(), { method: "POST", body: outgoing });
      const body = await response.text();

      return new Response(body, {
        status: response.status,
        headers: { ...cors, "Content-Type": response.headers.get("Content-Type") || "application/json" }
      });
    } catch (error) {
      return json({ error: error.message || "Proxy error" }, 500, cors);
    }
  }
};

function json(value, status, headers) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...headers, "Content-Type": "application/json" }
  });
}
