import { CHAPTER_STATUSES, SUPPORTED_LANGUAGES } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { ChaptersPage } from "@/features/catalog/components/chapters/chapters-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  status: z.enum(CHAPTER_STATUSES).optional().catch(undefined),
  language: z.enum(SUPPORTED_LANGUAGES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/chapters")({
  head: () => ({ meta: [{ title: m.catalog_chapter_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("chapter.list")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: ChaptersPage,
})
