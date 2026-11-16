import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { libraryCountsQueryOptions, libraryQueryOptions } from "@/features/library/api/library"
import { LibraryPage } from "@/features/library/components/library-page"
import { LIBRARY_PER_PAGE, librarySearchSchema } from "@/features/library/lib/library-search"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: m.library_meta_title() }] }),
  validateSearch: librarySearchSchema,
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    return { session: context.session }
  },
  loaderDeps: ({ search: { status, sort, q, page } }) => ({ status, sort, q, page }),
  loader: async ({ context, deps }) => {
    const prefetch = Promise.all([
      context.queryClient.query(
        libraryQueryOptions({
          status: deps.status,
          sort: deps.sort ?? "read",
          q: deps.q ?? "",
          page: deps.page ?? 1,
          perPage: LIBRARY_PER_PAGE,
          contentRatings: getContentRatings(context.session),
        }),
      ),
      context.queryClient.query(libraryCountsQueryOptions()),
    ]).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: LibraryPage,
})
