/* Service worker của trang Thế giới → Việt Nam trên jukytwo.github.io/tvn-hub/thegioi/ (web app cài lên máy).
   Trang và số liệu: mạng trước, mất mạng thì dùng bản đã lưu (số liệu trả kèm dấu X-TVN-Offline để trang ghi rõ).
   Thư viện, phông chữ, ảnh: dùng bản đã lưu trước, chưa có thì tải. e84e0c9f765645d6 đổi mỗi lần mẫu trang đổi. */
const V = "tvn-tg-e84e0c9f765645d6", DATA = "tvn-tg-data";
const SHELL = ["./", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("tvn-tg-") && k !== V && k !== DATA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === location.origin && u.pathname.endsWith("/data/the_gioi.json")) {
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(DATA).then(c => c.put("so-lieu", copy)); }
      return r;
    }).catch(() => caches.open(DATA).then(c => c.match("so-lieu")).then(hit => hit
      ? hit.text().then(t => new Response(t, { headers: { "Content-Type": "application/json", "X-TVN-Offline": "1" } }))
      : Response.error())));
    return;
  }
  const page = u.origin === location.origin && (req.mode === "navigate" || /\/thegioi\/(index\.html)?$/.test(u.pathname));
  if (page) {
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(V).then(c => c.put("./", copy)); }
      return r;
    }).catch(() => caches.open(V).then(c => c.match("./"))));
    return;
  }
  const lib = u.hostname === "cdnjs.cloudflare.com" || u.hostname === "fonts.googleapis.com" ||
    u.hostname === "fonts.gstatic.com" || u.origin === location.origin;
  if (lib) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(V).then(c => c.put(req, copy)); }
      return r;
    })));
  }
});
