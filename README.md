# FloraLens v0.6 — UK Garden Care Engine

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


## v0.5.1 Worker hotfix

The Perenual free-plan integration no longer makes an immediate second
`species/details/{id}` request after search. That second request was returning
HTTP 429 for the lavender test. FloraLens now uses the successful species-list
record directly and leaves Trefle/local care fallbacks in place for fields that
the free Perenual record does not contain.

No secret names changed.


## v0.6 — expanded care engine

This release replaces the tiny fallback table with a substantially broader
UK-garden-oriented care library covering 75 species/genus entries.

Resolution order is now:

1. FloraLens exact species guidance
2. Perenual usable species fields
3. Trefle usable botanical growing fields
4. FloraLens genus guidance
5. Friendly missing-field text

The UI labels whether the FloraLens match is species-level or genus-level.
Literal placeholders such as `Not available` are still treated as missing data.

The Cloudflare Worker and secret names are unchanged from v0.5.1.
For this release, the functional application change is in `app.js`.


## v0.7 — TRY trait engine

- Adds `traits.js` generated from TRY File Archive ID 81.
- Exact species trait records: 46,045.
- Genus aggregate fallbacks: 7,227.
- Uses TRY growth form, woodiness, succulence, habitat, leaf type and measured plant height.
- Missing care cards are hidden rather than displaying repeated “Not available”.
- Trait-derived watering/soil text is explicitly general guidance, not represented as TRY-provided horticultural advice.
- Existing Pl@ntNet/Cloudflare identification path is unchanged.

Attribution: Díaz et al. (2016), Nature, doi:10.1038/nature16489; Díaz et al. (2022), Scientific Data 9, 755, doi:10.1038/s41597-022-01774-9; TRY File Archive package DOI 10.17871/TRY.81.


## v0.8 — Botanical editorial redesign

A full visual refresh inspired by a premium botanical scrapbook rather than a generic card-based app.

- floating translucent navigation dock
- richer paper, sage, rose and lilac palette
- editorial Cormorant typography with handwritten botanical annotations
- more tactile Pinterest plant cards
- premium camera/lens treatment
- richer profile, care, season and timeline cards
- softer shadows, layered glass/paper surfaces and subtle motion
- cache-busted CSS/JS/trait files for easier GitHub Pages testing

No API or data-layer changes. Cloudflare and all existing secrets stay untouched.


## v0.8.1 UX hotfix

- The centre Lens button now launches the device camera immediately instead of opening the tall green camera interstitial first.
- The Home identification banner also launches the camera directly.
- Home garden cards now have a small delete control with confirmation.
- Deleting an entry removes its saved local photo as well as the plant record, while retaining the reusable species cache.
- Cloudflare Worker and API secrets are unchanged.


## v0.8.2 — Discover workflow

Discover is now a real saved-inspiration area rather than a placeholder.

- Launching the camera from Discover starts a Discover identification.
- After identification, the primary action is **Save to Discover**, not choose a garden area.
- A discovery stores the identification photo, scientific/common name, family and match score.
- Discoveries can be wishlisted, deleted, or later promoted into My Garden with an area.
- General Lens identifications now ask whether the plant belongs in My Garden or Discover.
- “Just looking — don’t save” is available for one-off identifications.
- Existing numeric demo discovery counts are migrated away in favour of real saved records.

No Cloudflare or API-secret changes are required.


## v0.8.3 — Discover detail profiles

- Discover cards are now tappable.
- A saved discovery opens the same full botanical/care profile used by My Garden.
- The detail screen returns to Discover rather than My Garden.
- Discovery-specific controls allow wishlist changes, Add to Garden and removal.
- The profile includes the original identification confidence and spotted date.
- Backup export now includes photos belonging to Discover records as well as Garden plants.
- No Cloudflare or API changes.


## v0.9 — Garden Journal & Plant Story
- Real dated journal moments linked to Garden plants.
- Optional photo and note.
- Flowering, New growth, Pruned, Moved, Problem, Repotted, Planted, Harvest and Note types.
- Chronological garden-wide Journal feed.
- Journal cards jump to plant profiles.
- Plant profiles show linked moments in Our Story.
- Journal photos included in backup export.
- No Cloudflare/API changes.


## v1.0 — Care Calendar
- New Care Calendar route with manual plant-linked jobs.
- Complete, edit, delete or move tasks one week.
- FloraLens generates cautious seasonal suggestions from each saved plant's existing care profile.
- Suggested jobs can be added to the calendar with one tap.
- Home screen shows a compact care status card.
- Individual Garden profiles can add a care job directly.
- Completed jobs retain a lightweight recent history.
- Care tasks live in the normal FloraLens backup state.
- No Cloudflare/API changes.


## v1.1 — Garden Map
- My Garden now switches between Gallery and Garden Map.
- The map turns existing areas into a visual botanical plan, including indoor spaces.
- Each area shows live plant counts and plant photo markers.
- Tap an area for its plant list; tap a marker to open the plant.
- Create, rename and remove areas from the map.
- Removing an area never deletes plants; they move safely to Unplaced.
- Garden plant profiles now show their current area with a Move Area action.
- Plants can be moved between existing areas or into a newly-created area.
- Existing users migrate automatically and keep all current data.
- No Cloudflare/API changes.


## v1.1.1 — Discover iPhone display hotfix
- Fixes a Safari/iOS multi-column fragmentation bug that could paint a duplicate heart/delete control beside a Discover card.
- Discover now uses a stable two-column grid on phones and three columns on wider screens.
- No discovery records or delete logic were changed.
- No Cloudflare/API changes.


## v1.2 — Seasonal Garden
- New “This month in your garden” seasonal card on Home.
- Seasonal view uses only known flowering-month data plus the user's own Journal history.
- Flowering Now and Coming Soon collections.
- Seasonal care suggestions can be added directly to Care Calendar.
- Bloom Mosaic builds from real Journal entries tagged Flowering with photos.
- New Garden Year preview summarises plants added, discoveries, journal moments, flowering moments, spaces and most-recorded plant.
- No invented flowering predictions where FloraLens lacks data.
- No Cloudflare/API changes.


## v1.2.1 — Discover Safari hard fix
- Reworked the Discover card controls rather than applying another CSS-column workaround.
- Heart and delete controls now live inside a normal grid overlay on the image instead of using absolute-positioned glass layers.
- Removed backdrop-filter and entrance transforms from Discover cards, avoiding the Safari/WebKit compositing bug that produced clickable “ghost” controls.
- No data model, Discover records, API or Cloudflare changes.


## v1.2.2 — Plant Atlas phenology
- Added local Plant Atlas 2020 phenology from the supplied dataset.
- 3,397 taxa with usable leaf and/or flowering phenology are packaged locally.
- Plant Atlas flowering months now feed profiles, Flowering Now and Coming Soon.
- The empty Seasonal Note fallback is gone; the card is hidden when there is no useful seasonal information.
- Plant Atlas-derived information is explicitly labelled.
- No Cloudflare changes.
