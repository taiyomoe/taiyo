import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { canOpenImages } from "@/features/catalog/lib/catalog-access"
import { CoverUploadPage } from "@/features/media-images/components/covers/cover-upload-page"
import { loadMediaOption } from "@/features/media-images/lib/media-option"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  mediaId: z.uuid().optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/covers/upload")({
  head: () => ({ meta: [{ title: m.catalog_cover_upload_meta_title() }] }),
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
  component: CoverUploadPage,
})
