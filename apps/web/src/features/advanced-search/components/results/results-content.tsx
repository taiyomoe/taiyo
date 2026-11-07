import * as stylex from "@stylexjs/stylex"
import { motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link, Navigate, useNavigate } from "@tanstack/react-router"
import { PagePagination } from "@/components/pagination/page-pagination"
import { ResultList } from "@/features/advanced-search/components/results/result-list"
import { ResultsEmpty } from "@/features/advanced-search/components/results/results-empty"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import { useSearchResults } from "@/features/advanced-search/hooks/use-search-results"
import { toUrlSearch } from "@/features/advanced-search/lib/advanced-search"

const styles = stylex.create({
  results: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    opacity: 1,
    transitionDuration: "200ms",
    transitionProperty: "opacity",
    transitionTimingFunction: motion.easeOut,
  },
  stale: {
    opacity: 0.55,
    transitionDelay: "150ms",
  },
})

export function ResultsContent() {
  const { search } = useAdvancedSearch()
  const navigate = useNavigate()
  const { hits, page, pageCount, isStale } = useSearchResults()
  const toPage = (target: number) => toUrlSearch({ ...search, page: target })

  if (!isStale && page > Math.max(pageCount, 1)) {
    return <Navigate replace search={toPage(Math.max(pageCount, 1))} to="/titles" />
  }

  if (hits.length === 0) {
    return <ResultsEmpty />
  }

  return (
    <div aria-busy={isStale} sx={[styles.results, isStale && styles.stale]}>
      <ResultList hits={hits} view={search.view} />
      <PagePagination
        onJump={(target) => {
          void navigate({ search: toPage(target), to: "/titles" })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => <Link search={toPage(target)} to="/titles" />}
      />
    </div>
  )
}
