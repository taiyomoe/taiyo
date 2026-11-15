import { noop } from "@tanstack/react-query"
import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { listQueryOptions } from "@/features/lists/api/lists"
import { EditListPage } from "@/features/lists/components/list-editor/edit-list-page"
import { isListNotFoundError } from "@/features/lists/components/list-page/list-error"
import { ListNotFoundPage } from "@/features/lists/components/list-page/list-not-found-page"
import { ALL_CONTENT_RATINGS } from "@/features/lists/lib/list-labels"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/lists/$listId_/edit")({
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    return { session: context.session }
  },
  loader: async ({ context, params: { listId } }) => {
    const list = context.queryClient.query(listQueryOptions(listId, ALL_CONTENT_RATINGS))

    if (import.meta.env.SSR) {
      await list.catch(noop)
    }

    const loaded = await list.catch((error: unknown) => {
      if (isListNotFoundError(error)) {
        throw notFound()
      }

      return null
    })

    return { name: loaded?.name ?? null }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.name === null || loaderData?.name === undefined
            ? m.list_editor_edit_title()
            : m.list_editor_edit_meta_title({ name: loaderData.name }),
      },
    ],
  }),
  component: EditListPage,
  notFoundComponent: ListNotFoundPage,
})
