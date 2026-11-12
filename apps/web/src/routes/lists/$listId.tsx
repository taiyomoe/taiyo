import { noop } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { listQueryOptions } from "@/features/lists/api/lists"
import { isListNotFoundError } from "@/features/lists/components/list-page/list-error"
import { ListNotFoundPage } from "@/features/lists/components/list-page/list-not-found-page"
import { ListPage } from "@/features/lists/components/list-page/list-page"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/lists/$listId")({
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

    return { name: loaded?.name ?? null, description: loaded?.description ?? null }
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? null
    const description = loaderData?.description?.slice(0, 160) ?? null

    return {
      meta: [
        { title: name === null ? m.list_meta_title_fallback() : m.list_meta_title({ name }) },
        ...(name === null ? [] : [{ property: "og:title", content: name }]),
        ...(description === null || description === ""
          ? []
          : [
              { name: "description", content: description },
              { property: "og:description", content: description },
            ]),
      ],
    }
  },
  component: ListPage,
  notFoundComponent: ListNotFoundPage,
})
