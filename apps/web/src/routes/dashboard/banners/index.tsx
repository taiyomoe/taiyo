import { CONTENT_RATINGS } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { BannersPage } from "@/features/catalog/components/banners/banners-page"
import { canOpenImages } from "@/features/catalog/lib/catalog-access"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  contentRating: z.enum(CONTENT_RATINGS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/banners/")({
  head: () => ({ meta: [{ title: m.media_banners_dashboard_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!canOpenImages(getPermissions(context.session.user))) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: BannersPage,
})
