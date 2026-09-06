# FloraLens

A private, mobile-first botanical journal and plant-identification web app.

## Current starter build
- Pinterest-style botanical Home screen
- My Garden collection with search
- Mobile camera/gallery Lens flow
- Identification loading/result experience
- Alternative matches UI
- Rich plant profiles
- Local persistence using `localStorage`
- Garden journal
- Discover area
- Demo identification fallback so the UI works before API credentials are connected

## Pl@ntNet integration
FloraLens is prepared for Pl@ntNet's `/v2/identify/{project}` flow.

**Do not put your Pl@ntNet private API key in `app.js`.**

Use a tiny server-side/serverless proxy, then set `API_PROXY_URL` at the top of `app.js` to that proxy URL.

The front end currently sends:
- multipart `images`
- `organs=auto`

The data model can be expanded to send up to five images and matching plant-organ values (`leaf`, `flower`, `fruit`, `bark`, `auto`).

## Run locally
Any simple static server works.

Example:
```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Files
- `index.html`
- `styles.css`
- `app.js`
- `README.md`

## Next recommended build steps
1. Add secure Pl@ntNet proxy.
2. Add multiple-image guided identification.
3. Add botanical enrichment/cache layer.
4. Replace demo plant art with user photographs after plants are saved.
5. Add Garden Areas and care calendar.
6. Add backup/export so the private collection is portable.
