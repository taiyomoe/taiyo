import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { BannersPage } from "@/features/media-images/components/banners/banners-page"
import { loadMediaOption } from "@/features/media-images/lib/media-option"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  mediaId: z.uuid().optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/banners")({
  head: () => ({ meta: [{ title: m.media_banners_dashboard_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("media.update")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({ mediaId: search.mediaId }),
  loader: async ({ context, deps }) => ({
    media: await loadMediaOption(context.queryClient, deps.mediaId),
  }),
  component: BannersPage,
})
