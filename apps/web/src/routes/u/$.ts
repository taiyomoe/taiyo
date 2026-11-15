import { createFileRoute } from "@tanstack/react-router"
import { proxyToUmami } from "@/features/analytics/lib/umami-proxy"

export const Route = createFileRoute("/u/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => proxyToUmami(request, params._splat ?? ""),
      POST: ({ request, params }) => proxyToUmami(request, params._splat ?? ""),
    },
  },
})
