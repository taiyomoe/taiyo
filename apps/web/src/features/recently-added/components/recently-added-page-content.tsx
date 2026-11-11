import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, Navigate, useNavigate } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { PagePagination } from "@/components/pagination/page-pagination"
import { ResultList } from "@/features/advanced-search/components/results/result-list"
import { SEARCH_MAX_RESULTS, SEARCH_PER_PAGE } from "@/features/advanced-search/lib/advanced-search"
import { recentlyAddedQueryOptions } from "@/features/recently-added/api/recently-added"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const toSearch = (page: number) => ({ page: page === 1 ? undefined : page })

export function RecentlyAddedPageContent({ page }: { page: number }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(recentlyAddedQueryOptions(contentRatings, page))
  const navigate = useNavigate()
  const pageCount = Math.ceil(Math.min(data.meta.total, SEARCH_MAX_RESULTS) / SEARCH_PER_PAGE)

  if (page > Math.max(pageCount, 1)) {
    return <Navigate replace search={toSearch(Math.max(pageCount, 1))} to="/recently-added" />
  }

  if (data.data.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.recently_added_empty_description()}
        title={m.recently_added_empty_title()}
      />
    )
  }

  return (
    <>
      <ResultList hits={data.data} view="cards" />
      <PagePagination
        onJump={(target) => {
          void navigate({ search: toSearch(target), to: "/recently-added" })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => <Link search={toSearch(target)} to="/recently-added" />}
      />
    </>
  )
}
