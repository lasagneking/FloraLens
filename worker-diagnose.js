/*
  FloraLens Worker — add a /diagnose route for Plant Doctor
  ---------------------------------------------------------
  Paste handleDiagnose() into your existing floralens-api Worker, then add the
  route check shown at the bottom inside your fetch() handler, next to /identify.

  It uses the same Pl@ntNet key as /identify. If your Worker stores the key under
  a different secret name, change PLANTNET_KEY_NAME below.
*/

const PLANTNET_KEY_NAME = "PLANTNET_API_KEY";

async function handleDiagnose(request, env, corsHeaders) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const incoming = await request.formData();
  const forward = new FormData();
  for (const img of incoming.getAll("images")) forward.append("images", img);
  for (const organ of incoming.getAll("organs")) forward.append("organs", organ);

  const params = new URLSearchParams({
    "api-key": env[PLANTNET_KEY_NAME],
    lang: incoming.get("lang") || "en",
    "nb-results": incoming.get("nb-results") || "5",
    "include-related-images": incoming.get("include-related-images") || "true",
  });

  const upstream = await fetch(
    `https://my-api.plantnet.org/v2/diseases/identify?${params}`,
    { method: "POST", body: forward }
  );

  // Pass Pl@ntNet's status and JSON straight through (404 = no disease matched).
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/*
  Inside your fetch(request, env) handler, alongside the /identify route:

    const url = new URL(request.url);
    if (url.pathname === "/diagnose") {
      return handleDiagnose(request, env, corsHeaders);
    }

  `corsHeaders` is whatever object your /identify route already uses
  (e.g. { "Access-Control-Allow-Origin": "*", ... }). Make sure your OPTIONS
  preflight handling covers /diagnose too — if it's handled globally it will.
*/
