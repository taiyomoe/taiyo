// Umami runs inside the cluster: the web relays only what the tracker needs, under its own
// origin, so the dashboard and the rest of Umami's API stay private.
const UMAMI_ROUTES: Record<string, { method: string; upstream: string } | undefined> = {
  "s.js": { method: "GET", upstream: "/script.js" },
  "api/send": { method: "POST", upstream: "/api/send" },
}
const MAX_BODY_BYTES = 64_000
const FORWARDED_REQUEST_HEADERS = ["content-type", "user-agent", "x-umami-cache"]
// Cloudflare sets this header on every request it forwards: Umami derives the visitor's
// location from it, and would otherwise see the web server's address.
const CLIENT_IP_HEADER = "cf-connecting-ip"
const notFound = () => new Response(null, { status: 404 })
// The tracker strips the query string before it sends a page (`data-exclude-search`): a URL that
// still carries one comes from a tab opened before that setting, which tracked every rewrite of
// the reader's `?page=` as a view. Umami's tracker stops for good on `disabled`.
const isStaleTracker = (body: ArrayBuffer) => {
  try {
    const event: unknown = JSON.parse(new TextDecoder().decode(body))
    const url =
      typeof event === "object" &&
      event !== null &&
      "payload" in event &&
      typeof event.payload === "object" &&
      event.payload !== null &&
      "url" in event.payload
        ? event.payload.url
        : undefined

    return typeof url === "string" && url.includes("?")
  } catch {
    return false
  }
}

export const proxyToUmami = async (request: Request, path: string) => {
  const upstreamBase = process.env.UMAMI_INTERNAL_URL
  const route = UMAMI_ROUTES[path]

  if (upstreamBase === undefined || upstreamBase === "" || route === undefined) {
    return notFound()
  }

  if (route.method !== request.method) {
    return new Response(null, { status: 405, headers: { allow: route.method } })
  }

  const headers = new Headers()

  for (const name of [...FORWARDED_REQUEST_HEADERS, CLIENT_IP_HEADER]) {
    const value = request.headers.get(name)

    if (value !== null) {
      headers.set(name, value)
    }
  }

  const length = Number(request.headers.get("content-length"))

  if (
    route.method === "POST" &&
    (!Number.isInteger(length) || length <= 0 || length > MAX_BODY_BYTES)
  ) {
    return new Response(null, { status: 413 })
  }

  const body = route.method === "POST" ? await request.arrayBuffer() : null

  if (body !== null && isStaleTracker(body)) {
    return Response.json({ disabled: true }, { headers: { "cache-control": "no-store" } })
  }

  const upstream = await fetch(new URL(route.upstream, upstreamBase), {
    method: route.method,
    headers,
    body,
  }).catch(() => null)

  if (upstream === null) {
    return new Response(null, { status: 502 })
  }

  const responseHeaders = new Headers({
    "cache-control": route.method === "GET" ? "public, max-age=3600" : "no-store",
  })
  const contentType = upstream.headers.get("content-type")

  if (contentType !== null) {
    responseHeaders.set("content-type", contentType)
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}
