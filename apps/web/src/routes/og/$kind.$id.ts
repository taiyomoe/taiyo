import { createFileRoute } from "@tanstack/react-router"
import { loadOgCard } from "@/features/og/lib/og-data"
import { getOrigin, OG_KINDS, type OgKind } from "@/features/og/lib/og-meta"
import { renderOgImage } from "@/features/og/lib/og-renderer"

const isKind = (kind: string): kind is OgKind => OG_KINDS.some((known) => known === kind)

export const Route = createFileRoute("/og/$kind/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const card = isKind(params.kind)
          ? await loadOgCard(params.kind, params.id, new URL(getOrigin()).host)
          : null
        const image =
          card === null ? null : await renderOgImage(card.element, card.images).catch(() => null)

        if (image === null) {
          return new Response(null, {
            status: 302,
            headers: { location: "/og/taiyo.jpg", "cache-control": "public, max-age=300" },
          })
        }

        return new Response(new Uint8Array(image), {
          headers: {
            "content-type": "image/jpeg",
            "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        })
      },
    },
  },
})
