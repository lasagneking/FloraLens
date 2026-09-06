# FloraLens v0.2

This build turns the starter Lens into a real identification-ready system.

## What changed
- 1–5 photos of the **same individual plant**
- Per-photo organ labels: Auto, Flower, Leaf, Fruit, Bark
- Ranked identification matches and confidence values
- Remaining daily Pl@ntNet quota display when real API is connected
- Confirm-before-save flow
- Garden area picker + custom areas
- Real hero photo saved locally in **IndexedDB**
- Plant metadata saved separately in localStorage
- Species cache, ready for the next enrichment layer
- Included secure **Cloudflare Worker** proxy
- Demo fallback still works until the proxy is configured

## Why there is a proxy
Pl@ntNet's API key is private. Putting it in browser JavaScript would expose it to anyone who can inspect the page source.

The Worker keeps that key server-side.

## Connect the real Pl@ntNet API

### 1. Create a Pl@ntNet developer account and API key
Use Pl@ntNet's developer portal.

### 2. Deploy the included Cloudflare Worker
This folder includes:
- `worker.js`
- `wrangler.toml`

Using Wrangler:

```bash
npx wrangler login
npx wrangler secret put PLANTNET_API_KEY
npx wrangler deploy
```

Paste your Pl@ntNet API key when prompted for the secret.

Cloudflare will return a Worker URL similar to:
`https://floralens-api.<your-subdomain>.workers.dev`

### 3. Put the Worker URL in app.js
Near the top of `app.js`, change:

```js
const API_PROXY_URL = "";
```

to:

```js
const API_PROXY_URL = "https://floralens-api.<your-subdomain>.workers.dev";
```

Then upload the updated static app as normal.

## Photo storage
Confirmed plant hero photos are stored using IndexedDB on the device/browser instead of base64 strings in localStorage. This is much more suitable for a growing personal photo collection.

A later backup/export feature should explicitly include IndexedDB images as well as metadata.

## Species cache
Every confirmed scientific species gets a reusable local species record. v0.3 can enrich that record once with care/growing information and reuse it for every plant of the same species.

## Current next milestone
FloraLens v0.3 should add:
1. Free botanical enrichment.
2. Source-aware care information.
3. Flowering / pruning / hardiness calendar.
4. Per-plant multi-photo timeline.
5. Backup/export.
