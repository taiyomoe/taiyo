import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { mediaEditQueryOptions } from "@/features/media-suggestions/api/media-suggestions"
import { MediaEditPage } from "@/features/media-suggestions/components/media-edit/media-edit-page"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/media/$mediaId_/edit")({
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    if (!getPermissions(context.session.user)("media.suggest")) {
      throw redirect({ to: "/" })
    }

    return { session: context.session }
  },
  loader: async ({ context, params: { mediaId } }) => {
    const prefetch = Promise.all([
      context.queryClient.query(mediaEditQueryOptions(mediaId)),
      context.queryClient.query(mediaQueryOptions(mediaId)),
    ]).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }

    const title = await context.queryClient
      .query(mediaQueryOptions(mediaId))
      .then((data) => getMainTitle(data.titles))
      .catch(() => null)

    return { title }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: m.media_edit_meta_title({ title: loaderData?.title ?? m.media_untitled() }),
      },
    ],
  }),
  component: MediaEditPage,
})
