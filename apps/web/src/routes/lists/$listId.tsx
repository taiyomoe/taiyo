import { noop } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { getRichTextSummary } from "@/components/rich-text/rich-text-document"
import { listQueryOptions } from "@/features/lists/api/lists"
import { isListNotFoundError } from "@/features/lists/components/list-page/list-error"
import { ListNotFoundPage } from "@/features/lists/components/list-page/list-not-found-page"
import { ListPage } from "@/features/lists/components/list-page/list-page"
import { pageOgMeta } from "@/features/og/lib/og-meta"
import { serveLinkPreview } from "@/features/og/lib/og-preview"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/lists/$listId")({
  server: {
    handlers: {
      GET: ({ request, params, next }) =>
        serveLinkPreview({ request, next, kind: "lists", id: params.listId }),
    },
  },
  loader: async ({ context, params: { listId } }) => {
    const list = context.queryClient.query(
      listQueryOptions(listId, getContentRatings(context.session)),
    )

    if (import.meta.env.SSR) {
      await list.catch(noop)
    }

    const loaded = await list.catch((error: unknown) => {
      if (isListNotFoundError(error)) {
        throw notFound()
      }

      return null
    })

    return {
      name: loaded?.name ?? null,
      description: getRichTextSummary(loaded?.description),
    }
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.name ?? null

    return {
      meta: [
        { title: name === null ? m.list_meta_title_fallback() : m.list_meta_title({ name }) },
        ...pageOgMeta({
          kind: "lists",
          id: params.listId,
          title: name,
          description: loaderData?.description,
        }),
      ],
    }
  },
  component: ListPage,
  notFoundComponent: ListNotFoundPage,
})
