// @ts-nocheck
const CACHE = "psychekit";
const CORE = ["/", "/o-projekcie/", "/prywatnosc/", "/licencje/", "/manifest.webmanifest"];
// Strony z wynikiem i historią nigdy nie trafiają do pamięci podręcznej.
const WYKLUCZONE = /^\/(wynik|historia)\/?$/;

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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || WYKLUCZONE.test(url.pathname)) return;

  // Dokumenty: najpierw sieć, żeby po wdrożeniu nie zostawała stara wersja strony.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => zapisz(request, response))
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
    );
    return;
  }

  // Zasoby mają nazwy zawierające skrót treści, więc mogą być podawane z pamięci podręcznej.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => zapisz(request, response))),
  );
});
