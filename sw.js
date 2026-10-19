/* FloraLens service worker
   - Precaches the app shell so Garden, Journal and Care open with no signal.
   - Pages: network first (so updates arrive), cached copy when offline.
   - Versioned files (?v=…), plant data shards and fonts: cache first.
   - API calls (identify, diagnose, enrich, GBIF): always network, never cached.
   Bump VERSION whenever you deploy; the app then offers "Update ready". */
const VERSION = "3.12.0";
const SHELL = `floralens-shell-${VERSION}`;
const RUNTIME = "floralens-runtime";

const SHELL_FILES = [
  "./",
  "index.html",
  `styles.css?v=${VERSION}`,
  `icons.js?v=${VERSION}`,
  `traits.js?v=${VERSION}`,
  `phenology.js?v=${VERSION}`,
  `app.js?v=${VERSION}`,
  "world-map.svg?v=1.2.17",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/bg-garden.jpg",
  "icons/bg-spring.jpg",
  "icons/bg-summer.jpg",
  "icons/bg-autumn.jpg",
  "icons/bg-winter.jpg",
  "icons/doctor-guide.jpg?v=2",
  "icons/guide-identify.jpg?v=1",
  "icons/guide-garden-centre.jpg?v=1",
  "icons/disc-trip.jpg?v=1",
  "icons/disc-trip-live.jpg?v=1",
  "icons/disc-saved.jpg?v=1",
  "lib/leaflet.js?v=1.9.4",
  "lib/leaflet.css?v=1.9.4"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // Add one at a time so a single missing file can't block the install.
    await Promise.all(SHELL_FILES.map(url =>
      cache.add(new Request(url, { cache: "reload" })).catch(err => console.warn("SW precache skipped", url, err))
    ));
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("floralens-shell-") && k !== SHELL).map(k => caches.delete(k)));
    // 3.10 cached CARTO's "API key required" tiles; throw those away.
    try {
      const rt = await caches.open(RUNTIME);
      for (const req of await rt.keys()) if (req.url.includes("cartocdn.com")) await rt.delete(req);
    } catch {}
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

const API_HOSTS = /workers\.dev$|api\.gbif\.org$|plantnet\.org$|raw\.githubusercontent\.com$/;
const FONT_HOSTS = /^fonts\.(googleapis|gstatic)\.com$/;
const MAP_TILES = /^tile\.openstreetmap\.org$/;   // trip maps: keep tiles she has seen, so past trips show offline

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;               // uploads go straight to the network
  const url = new URL(req.url);
  if (API_HOSTS.test(url.hostname)) return;       // live data only

  // Page loads: try the network for the latest version, fall back to the cached shell.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(SHELL);
        cache.put("index.html", fresh.clone());
        return fresh;
      } catch {
        return (await caches.match("index.html")) || (await caches.match("./")) || Response.error();
      }
    })());
    return;
  }

  // Same-origin files and Google Fonts: cache first, then network (and remember it).
  if (url.origin === self.location.origin || FONT_HOSTS.test(url.hostname) || MAP_TILES.test(url.hostname)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") {
          const cache = await caches.open(url.origin === self.location.origin && SHELL_FILES.some(f => url.pathname.endsWith(f.split("?")[0])) ? SHELL : RUNTIME);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        return cached || Response.error();
      }
    })());
  }
});
