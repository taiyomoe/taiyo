import { CONTENT_RATINGS, MEDIA_LANGUAGES } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { CoversPage } from "@/features/catalog/components/covers/covers-page"
import { canOpenImages } from "@/features/catalog/lib/catalog-access"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  language: z.enum(MEDIA_LANGUAGES).optional().catch(undefined),
  contentRating: z.enum(CONTENT_RATINGS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/covers/")({
  head: () => ({ meta: [{ title: m.media_covers_dashboard_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!canOpenImages(getPermissions(context.session.user))) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: CoversPage,
})
