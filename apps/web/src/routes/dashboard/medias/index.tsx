import { MEDIA_STATUSES, MEDIA_TYPES } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { MediasPage } from "@/features/catalog/components/medias/medias-page"
import { canOpenMedias } from "@/features/catalog/lib/catalog-access"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  type: z.enum(MEDIA_TYPES).optional().catch(undefined),
  status: z.enum(MEDIA_STATUSES).optional().catch(undefined),
  deleted: z.boolean().optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/medias/")({
  head: () => ({ meta: [{ title: m.catalog_media_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!canOpenMedias(getPermissions(context.session.user))) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: MediasPage,
})
