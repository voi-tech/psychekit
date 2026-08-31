// @ts-nocheck
// Nazwa zmienia się przy zmianie strategii, żeby stare wpisy zniknęły przy aktywacji.
const CACHE = "psychekit-v2";
const CORE = ["/", "/o-projekcie/", "/prywatnosc/", "/licencje/", "/manifest.webmanifest"];
// Strony z wynikiem i historią nigdy nie trafiają do pamięci podręcznej.
const WYKLUCZONE = /^\/(wynik|historia)\/?$/;
// Tylko te ścieżki mają w nazwach skrót treści, więc tylko one mogą iść prosto z pamięci.
const NIEZMIENNE = /^\/(_astro|fonts)\//;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function zapisz(request, response) {
  if (!response || !response.ok || response.type !== "basic") return response;
  const copy = response.clone();
  const cache = await caches.open(CACHE);
  await cache.put(request, copy);
  return response;
}

function najpierwSiec(request, zapasowa) {
  return fetch(request)
    .then((response) => zapisz(request, response))
    .catch(() => caches.match(request).then((cached) => cached || (zapasowa ? caches.match(zapasowa) : undefined)));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || WYKLUCZONE.test(url.pathname)) return;

  // Zasoby ze skrótem treści w nazwie nigdy się nie zmieniają pod tym samym adresem.
  if (NIEZMIENNE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => zapisz(request, response))),
    );
    return;
  }

  // Wszystko pozostałe ma stałą nazwę, więc po wdrożeniu musi zostać pobrane na nowo.
  event.respondWith(najpierwSiec(request, request.mode === "navigate" ? "/" : undefined));
});
