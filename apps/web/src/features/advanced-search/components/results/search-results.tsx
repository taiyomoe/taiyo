import { CatchBoundary } from "@tanstack/react-router"
import { Suspense } from "react"
import { ResultListSkeleton } from "@/features/advanced-search/components/results/result-list"
import { ResultsContent } from "@/features/advanced-search/components/results/results-content"
import { ResultsError } from "@/features/advanced-search/components/results/results-error"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import { SEARCH_PER_PAGE } from "@/features/advanced-search/lib/advanced-search"

export function SearchResults() {
  const { search } = useAdvancedSearch()

  return (
    <CatchBoundary errorComponent={ResultsError} getResetKey={() => JSON.stringify(search)}>
      <Suspense fallback={<ResultListSkeleton count={SEARCH_PER_PAGE} view={search.view} />}>
        <ResultsContent />
      </Suspense>
    </CatchBoundary>
  )
}
