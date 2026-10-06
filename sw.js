/* SystemADF 2.17.21 · generated during npm run build. */
const RELEASE = "2.17.21";
const BUILD_ID = "2.17.21-muwfg8ok";
const APP_CACHE_PREFIX = "systemadf-app-";
const APP_CACHE = APP_CACHE_PREFIX + BUILD_ID;
const IMAGE_CACHE = "systemadf-images-v4";
const FONT_CACHE = "systemadf-fonts-v3";
const OFFLINE_URL = "/offline.html";
const APP_SHELL = "/index.html";
const PRECACHE = ["/","/404.html","/app-icons/apple-touch-icon.png","/app-icons/icon-192.png","/app-icons/icon-512.png","/assets/html2canvas.esm-BTH0Ap93.js","/assets/index-C8au3Joz.js","/assets/index-CevSbIIY.css","/assets/index-CRUIfKSc.js","/assets/index-D-3j0pJY.js","/assets/index-Dl5IGMoL.js","/assets/index-DTX-icSj.js","/assets/index-DxIUANCZ.js","/assets/index.es-BWRYrcCV.js","/assets/jspdf.es.min-DCQoc_Zy.js","/assets/jsQR-Ksaar86T.js","/assets/notificationRuntime-DMtAVr3x.js","/assets/purify.es-Dlc2MFTI.js","/assets/vision_bundle-DBtvWB-X.js","/assets/web-1MkzIlR6.js","/assets/web-CUmCSb2x.js","/assets/web-DvokLzuS.js","/assets/web-uK1-OXTP.js","/index.html","/manifest.webmanifest","/offline.html","/version.json"];
const PRECACHE_PATHS = new Set(PRECACHE.map((entry) => new URL(entry, self.location.origin).pathname));
const MAX_IMAGE_ENTRIES = 180;
const MAX_FONT_ENTRIES = 32;
const MAX_CACHEABLE_BYTES = 12 * 1024 * 1024;

function cacheableResponse(response, request) {
  if (request && isSupabaseStorage(request) && !response?.ok) return false;
  if (!response) return false;
  if (!(response.ok || response.type === "opaque")) return false;
  const length = Number(response.headers.get("content-length") || 0);
  return !length || length <= MAX_CACHEABLE_BYTES;
}

function isSupabaseStorage(request) {
  const url = new URL(request.url);
  return url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/storage/v1/");
}

function fetchRuntime(request) {
  if (!isSupabaseStorage(request)) return fetch(request);
  return fetch(new Request(request, { mode: "cors", credentials: "omit" }));
}

function bypassImageCache(request) {
  return new URL(request.url).searchParams.has("adf_image_retry");
}

function runtimeCacheKey(request) {
  const url = new URL(request.url);
  if (url.hostname.endsWith(".supabase.co") && url.pathname.includes("/storage/v1/object/sign/")) {
    url.searchParams.delete("token");
    url.searchParams.delete("adf_image_retry");
    return url.toString();
  }
  return request;
}

async function trimCache(cacheName, maximum) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const overflow = Math.max(0, keys.length - maximum);
  await Promise.all(keys.slice(0, overflow).map((key) => cache.delete(key)));
}

async function cacheFirst(request, cacheName, maximum) {
  const cache = await caches.open(cacheName);
  const key = runtimeCacheKey(request);
  const cached = bypassImageCache(request) ? undefined : await cache.match(key, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetchRuntime(request);
  if (cacheableResponse(response, request)) {
    await cache.put(key, response.clone()).catch(() => undefined);
    if (maximum) await trimCache(cacheName, maximum).catch(() => undefined);
  }
  return response;
}

async function staleWhileRevalidate(event, request, cacheName, maximum) {
  const cache = await caches.open(cacheName);
  const key = runtimeCacheKey(request);
  const cached = bypassImageCache(request) ? undefined : await cache.match(key, { ignoreVary: true });
  const refresh = fetchRuntime(request).then(async (response) => {
    if (cacheableResponse(response, request)) {
      await cache.put(key, response.clone()).catch(() => undefined);
      if (maximum) await trimCache(cacheName, maximum).catch(() => undefined);
    }
    return response;
  });
  if (cached) {
    event.waitUntil(refresh.catch(() => undefined));
    return cached;
  }
  return refresh;
}

async function appAsset(request) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
  return cached || fetch(request);
}

async function navigation(request) {
  const cache = await caches.open(APP_CACHE);
  const shell = await cache.match(APP_SHELL);
  if (shell) return shell;
  try {
    return await fetchRuntime(request);
  } catch {
    return (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function broadcast(message) {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  windows.forEach((client) => client.postMessage(message));
}

async function warmImages(urls) {
  const cache = await caches.open(IMAGE_CACHE);
  await Promise.all((urls || []).slice(0, 80).map(async (source) => {
    try {
      const url = new URL(source, self.location.origin);
      if (!/^https?:$/.test(url.protocol)) return;
      const request = new Request(url.toString(), {
        mode: url.origin === self.location.origin ? "same-origin" : "no-cors",
        credentials: url.origin === self.location.origin ? "same-origin" : "omit",
      });
      const response = await fetchRuntime(request);
      if (cacheableResponse(response, request)) await cache.put(runtimeCacheKey(request), response);
    } catch {
      // Continue warming the other visible images.
    }
  }));
  await trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES).catch(() => undefined);
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    const olderAppCaches = names.filter((name) => name.startsWith(APP_CACHE_PREFIX) && name !== APP_CACHE);
    const keepPrevious = olderAppCaches.at(-1);
    await Promise.all(names.map((name) => {
      const obsoleteApp = name.startsWith(APP_CACHE_PREFIX) && name !== APP_CACHE && name !== keepPrevious;
      const obsoleteOffline = name.startsWith("systemadf-offline-");
      const obsoleteImages = name.startsWith("systemadf-images-") && name !== IMAGE_CACHE;
      return obsoleteApp || obsoleteOffline || obsoleteImages ? caches.delete(name) : Promise.resolve(false);
    }));
    await self.clients.claim();
    await broadcast({ type: "SYSTEMADF_CACHE_READY", version: RELEASE, buildId: BUILD_ID });
  })());
});

self.addEventListener("message", (event) => {
  const type = event.data?.type;
  if (type === "SKIP_WAITING") self.skipWaiting();
  if (type === "CACHE_IMAGE_URLS") event.waitUntil(warmImages(event.data.urls));
  if (type === "CLEAR_PRIVATE_CACHE") {
    event.waitUntil(Promise.all([caches.delete(IMAGE_CACHE), caches.delete(FONT_CACHE)]));
  }
  if (type === "GET_CACHE_VERSION") {
    event.source?.postMessage?.({ type: "SYSTEMADF_CACHE_READY", version: RELEASE, buildId: BUILD_ID });
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("range")) return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.origin === self.location.origin && url.pathname.startsWith("/downloads/")) return;

  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(navigation(request));
    return;
  }

  if (url.origin === self.location.origin && PRECACHE_PATHS.has(url.pathname)) {
    event.respondWith(appAsset(request));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(event, request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
    return;
  }

  if (request.destination === "font" || (url.origin === self.location.origin && url.pathname.startsWith("/content-fonts/"))) {
    event.respondWith(cacheFirst(request, FONT_CACHE, MAX_FONT_ENTRIES));
  }
});
