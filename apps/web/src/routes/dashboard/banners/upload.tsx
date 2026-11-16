import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { canOpenImages } from "@/features/catalog/lib/catalog-access"
import { BannerUploadPage } from "@/features/media-images/components/banners/banner-upload-page"
import { loadMediaOption } from "@/features/media-images/lib/media-option"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  mediaId: z.uuid().optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/banners/upload")({
  head: () => ({ meta: [{ title: m.catalog_banner_upload_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!canOpenImages(getPermissions(context.session.user))) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({ mediaId: search.mediaId }),
  loader: async ({ context, deps }) => ({
    media: await loadMediaOption(context.queryClient, deps.mediaId),
  }),
  component: BannerUploadPage,
})
