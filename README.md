# FloraLens v0.5 — Real Care Coverage

FloraLens v0.3 keeps the working Pl@ntNet identification flow and adds the first real botanical-intelligence layer.

## New in v0.3
- Species enrichment route: `GET /enrich?name=Scientific%20name`
- Free GBIF taxonomy/description enrichment with no extra key
- Optional Trefle growing-data enrichment
- Species-level cache: enrich once, reuse for every matching plant
- Richer editorial plant profile
- Light, moisture, soil, pH, height, spread, growth habit/rate and recorded temperature fields when available
- Flowering-month timeline from source data
- “Right now” seasonal context
- Data-source labels and coverage indicator
- Safety information only shown when a connected source supplies a toxicity field
- Garden backup export, including IndexedDB hero photos

## IMPORTANT: keep the working Pl@ntNet secret
Do not change or remove:
`PLANTNET_API_KEY`

The new Worker deliberately retains the `/identify` code path that fixed live identification.

## Deploy the updated Worker
Replace the current Cloudflare Worker code with `worker.js` from this package, then Deploy.

The Worker URL in `app.js` is already:
`https://floralens-api.lrthumwood.workers.dev`

## GBIF
No additional setup is needed. The Worker uses GBIF's public Species API for taxonomic enrichment.

## Trefle — optional but recommended for care/growing fields
Trefle requires a personal access token.

Once you have a token, add a second Cloudflare runtime secret:

Name:
`TREFLE_TOKEN`

Type:
`Secret`

Value:
your Trefle access token

Do not put the Trefle token in `app.js`.

If `TREFLE_TOKEN` is absent, FloraLens still works. Identification remains live and GBIF enrichment still runs; the profile explains that richer growing fields are not yet connected.

## Data design
Plant-specific information:
- photo
- garden area
- added date
- journal/history

Species-level information:
- taxonomy
- growing requirements
- flowering months
- habit
- safety flags
- source metadata

This separation is intentional. Ten plants of the same species can have ten different stories while reusing one botanical knowledge record.

## Backup
Open the top-left menu and choose **Export backup**.

The JSON backup contains:
- local app state
- garden plants
- journal
- species cache
- hero photos converted from IndexedDB to portable data URLs

Import/restore is the next backup milestone.


## v0.4 care fallback
Trefle is useful for species/taxonomy enrichment but many horticultural fields are sparse.
v0.4 therefore adds a labelled, local FloraLens care library.

Resolution order:
1. Trefle species-specific field, when present
2. FloraLens species-specific care note
3. FloraLens genus-level guidance
4. Friendly “Care detail not yet available” message

The interface no longer treats missing Trefle fields as an API failure.

Initial curated coverage includes:
- English lavender / Lavandula genus
- Hydrangea macrophylla / Hydrangea genus
- Rosa genus
- Rosemary
- Foxglove
- Common box

The library is intentionally explicit and expandable rather than inventing care facts for unknown plants.

Existing Pl@ntNet, GBIF and Trefle connections remain unchanged.


## v0.5 — coverage fix

v0.4 only contained a very small local fallback table. v0.5 fixes that design.

Care priority is now:
1. Perenual horticultural species data (when configured and matched)
2. Trefle botanical growing fields
3. FloraLens curated species/genus guidance
4. Friendly missing-field text only when none of those has usable data

v0.5 also:
- treats literal strings such as "Not available" as missing data instead of letting them override a valid fallback
- refreshes care values already stored on existing plants
- updates cached plants after enrichment even when Trefle itself is sparse
- uses Perenual descriptions, watering, sunlight, soil, dimensions, growth rate, hardiness and toxicity flags when supplied

### Optional Perenual setup
Create a Perenual API key and add it to Cloudflare as a Secret:

`PERENUAL_API_KEY`

Then deploy the updated `worker.js`.

Do not change:
- `PLANTNET_API_KEY`
- `TREFLE_TOKEN`

Perenual is an additional fallback; Pl@ntNet identification remains unchanged.
