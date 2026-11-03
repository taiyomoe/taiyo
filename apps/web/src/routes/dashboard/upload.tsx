import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { groupQueryOptions } from "@/features/groups/api/groups"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { UploadPage } from "@/features/uploads/components/upload/upload-page"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  mediaId: z.uuid().optional().catch(undefined),
  groupId: z.uuid().optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/upload")({
  head: () => ({ meta: [{ title: m.upload_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  remountDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const [media, group] = await Promise.all([
      deps.mediaId === undefined
        ? null
        : context.queryClient
            .query(mediaQueryOptions(deps.mediaId))
            .then((data) => ({
              id: data.id,
              title: getMainTitle(data.titles) ?? "",
              type: data.type,
            }))
            .catch(() => null),
      deps.groupId === undefined
        ? null
        : context.queryClient
            .query(groupQueryOptions(deps.groupId))
            .then((data) => ({ id: data.id, name: data.name }))
            .catch(() => null),
    ])

    return { media, group }
  },
  component: UploadPage,
})
