// 離線快取:安裝時把首頁與它引用的 JS / CSS 存起來;
// 頁面走「先網路、失敗用快取」(有網路就拿到新版),其他檔案走「先快取」(檔名帶 hash,內容不會變)
const CACHE = 'algo-atlas-v1'
const STATIC = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    await cache.addAll(STATIC)
    const html = await (await cache.match('./')).text()
    const assets = [...html.matchAll(/(?:src|href)="(\.?\/?assets\/[^"]+)"/g)].map((m) => m[1])
    await cache.addAll(assets)
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req)
        const cache = await caches.open(CACHE)
        await cache.put('./', res.clone())
        return res
      } catch {
        return (await caches.match('./')) ?? Response.error()
      }
    })())
    return
  }
  event.respondWith((async () => {
    const hit = await caches.match(req)
    if (hit) return hit
    const res = await fetch(req)
    if (res.ok) (await caches.open(CACHE)).put(req, res.clone())
    return res
  })())
})
