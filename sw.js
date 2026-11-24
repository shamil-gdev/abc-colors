// Offline-First Service Worker for iPad Home Screen Web App
const CACHE_NAME = 'sunny-park-abc-v5';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'white', 'brown'];
const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SHAPES = ['circle', 'square', 'triangle', 'heart', 'star', 'diamond', 'oval', 'rectangle'];
const PHRASES = [
  'welcome',
  'lets_play',
  'abc_time',
  'pop_balloons',
  'yay',
  'awesome',
  'wonderful',
  'all_colors',
  'all_numbers',
  'all_letters',
  'all_shapes',
  'shapes_ride',
  'colors_mode',
  'numbers_mode',
  'letters_mode',
];

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './illustrations.js',
  './audio-engine.js',
  './game-balloons.js',
  './game-shapes.js',
  './game-ducks.js',
  './game-abc-trace.js',
  './app.js',
  './manifest.json',
  './fonts/fredoka-600.woff2',
  './fonts/fredoka-700.woff2',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  ...LETTERS.map((c) => `./audio/letters/${c}.mp3`),
  ...LETTERS.map((c) => `./audio/words/${c}.mp3`),
  ...COLORS.map((c) => `./audio/colors/${c}.mp3`),
  ...NUMBERS.map((n) => `./audio/numbers/${n}.mp3`),
  ...SHAPES.map((s) => `./audio/shapes/${s}.mp3`),
  ...PHRASES.map((p) => `./audio/phrases/${p}.mp3`),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(PRECACHE_URLS).catch(() =>
          Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isCodeOrDocRequest(request, url) {
  if (request.mode === 'navigate') return true;
  const path = url.pathname.toLowerCase();
  return (
    path.endsWith('/') ||
    path.endsWith('.html') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.json')
  );
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate for .html, .js, .css, .json so startup is instant even on slow Wi-Fi
  if (isCodeOrDocRequest(event.request, url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request, { ignoreSearch: true }).then((cached) => {
          const networkPromise = fetch(event.request)
            .then((res) => {
              if (res && res.status === 200) {
                cache.put(event.request, res.clone());
              }
              return res;
            })
            .catch(() => cached || (event.request.mode === 'navigate' ? cache.match('./index.html') : undefined));
          return cached || networkPromise;
        })
      )
    );
    return;
  }

  // Cache-first for .mp3, .png, and other static media assets
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => undefined);
    })
  );
});
