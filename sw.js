/* FloraLens service worker
   - Precaches the app shell so Garden, Journal and Care open with no signal.
   - Pages: network first (so updates arrive), cached copy when offline.
   - Versioned files (?v=…), plant data shards and fonts: cache first.
   - API calls (identify, diagnose, enrich, GBIF): always network, never cached.
   Bump VERSION whenever you deploy; the app then offers "Update ready". */
const VERSION = "2.6.1";
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
  "icons/apple-touch-icon.png"
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
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

const API_HOSTS = /workers\.dev$|api\.gbif\.org$|plantnet\.org$|raw\.githubusercontent\.com$/;
const FONT_HOSTS = /^fonts\.(googleapis|gstatic)\.com$/;

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
  if (url.origin === self.location.origin || FONT_HOSTS.test(url.hostname)) {
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
