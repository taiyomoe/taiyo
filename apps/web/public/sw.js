const SHELL_CACHE = "taiyo-shell-v1"
const OFFLINE_CACHE = "taiyo-offline-v1"
const MANIFEST_PATH = "/__offline/manifest.json"
const SHELL_DESTINATIONS = new Set(["script", "style", "font", "worker", "manifest"])

const fromOffline = async (request, options) => {
  const cache = await caches.open(OFFLINE_CACHE)

  return cache.match(request, options)
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  )

const offlinePage = async () => {
  const manifest = await fromOffline(new Request(new URL(MANIFEST_PATH, self.location.origin)))
  const chapters = manifest === undefined ? [] : await manifest.json()
  const items = chapters
    .map(
      (chapter) =>
        `<li><a href="/chapters/${escapeHtml(chapter.id)}"><strong>${escapeHtml(chapter.mediaTitle)}</strong><span>${escapeHtml(chapter.label)}</span></a></li>`,
    )
    .join("")
  const body =
    chapters.length === 0
      ? "<p>This page isn't available offline. Download chapters from the reader menu to read them without a connection.</p>"
      : `<p>This page isn't available offline. These chapters are downloaded:</p><ul>${items}</ul>`

  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline · Taiyō</title><style>body{margin:0;padding:2rem 1rem;background:#111;color:#eee;font-family:system-ui,sans-serif}main{max-width:32rem;margin:0 auto}h1{font-size:1.25rem}p{color:#aaa}ul{list-style:none;padding:0;display:grid;gap:.5rem}a{display:grid;gap:.125rem;padding:.75rem 1rem;border-radius:.75rem;background:#1c1c1c;color:inherit;text-decoration:none}a span{color:#aaa;font-size:.875rem}</style></head><body><main><h1>You're offline</h1>${body}</main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  )
}

const navigate = async (request) => {
  try {
    return await fetch(request)
  } catch {
    return (await fromOffline(request, { ignoreSearch: true })) ?? offlinePage()
  }
}

const shell = async (request, url) => {
  const cache = await caches.open(SHELL_CACHE)

  if (url.pathname.startsWith("/assets/")) {
    const hit = await cache.match(request)

    if (hit !== undefined) {
      return hit
    }
  }

  try {
    const response = await fetch(request)

    if (response.ok) {
      await cache.put(request, response.clone())
    }

    return response
  } catch {
    return (await cache.match(request)) ?? Response.error()
  }
}

const offlineFirst = async (request) => (await fromOffline(request)) ?? fetch(request)

const networkFirst = async (request) => {
  try {
    return await fetch(request)
  } catch {
    return (await fromOffline(request)) ?? Response.error()
  }
}

self.addEventListener("install", () => {
  void self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith("taiyo-") && key !== SHELL_CACHE && key !== OFFLINE_CACHE) {
          await caches.delete(key)
        }
      }

      await self.clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") {
    return
  }

  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin

  if (request.mode === "navigate") {
    event.respondWith(navigate(request))
  } else if (sameOrigin && SHELL_DESTINATIONS.has(request.destination)) {
    event.respondWith(shell(request, url))
  } else if (request.destination === "image") {
    event.respondWith(offlineFirst(request))
  } else if (!sameOrigin || url.pathname.startsWith("/_api/") || url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request))
  }
})

const readPushMessage = (event) => {
  try {
    return event.data?.json() ?? {}
  } catch {
    return {}
  }
}

self.addEventListener("push", (event) => {
  const message = readPushMessage(event)

  event.waitUntil(
    self.registration.showNotification(message.title ?? "Taiyō", {
      body: message.body ?? "",
      icon: message.icon ?? "/web-app-manifest-192x192.png",
      badge: "/favicon-96x96.png",
      tag: message.tag,
      data: { url: message.url ?? "/notifications" },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const url = new URL(event.notification.data?.url ?? "/notifications", self.location.origin)

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window" })
      const client = windows.find((candidate) => new URL(candidate.url).origin === url.origin)

      if (client === undefined) {
        await self.clients.openWindow(url.href)

        return
      }

      await client.focus()
      await client.navigate(url.href).catch(() => self.clients.openWindow(url.href))
    })(),
  )
})
