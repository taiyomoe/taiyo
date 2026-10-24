import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense } from "react"
import { MediaEditPage } from "@/components/media-edit/media-edit-page"
import { getMainTitle } from "@/components/media/media-labels"
import { AppShell } from "@/components/shell/app-shell"
import { getPermissions } from "@/lib/permissions"
import { mediaEditQueryOptions } from "@/lib/queries/media-edit"
import { mediaQueryOptions } from "@/lib/queries/medias"
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
  component: function MediaEdit() {
    const { session } = Route.useRouteContext()
    const { mediaId } = Route.useParams()

    return (
      <AppShell user={session.user}>
        <Suspense>
          <MediaEditPage mediaId={mediaId} user={session.user} />
        </Suspense>
      </AppShell>
    )
  },
})
