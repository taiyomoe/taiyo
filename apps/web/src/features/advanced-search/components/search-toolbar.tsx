import * as stylex from "@stylexjs/stylex"
import { Shuffle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { CatchBoundary } from "@tanstack/react-router"
import { Suspense } from "react"
import { controlStyles } from "@/features/advanced-search/components/control-styles"
import { ResultsCount } from "@/features/advanced-search/components/results/results-count"
import { ViewSwitcher } from "@/features/advanced-search/components/view-switcher"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import { useRandomTitle } from "@/features/advanced-search/hooks/use-random-title"
import { countActiveFilters } from "@/features/advanced-search/lib/advanced-search"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  toolbar: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: { default: "flex-start", [breakpoints.sm]: "flex-end" },
    marginInlineStart: "auto",
  },
  countSkeleton: {
    height: "1.25rem",
    width: "7rem",
  },
})

export function SearchToolbar() {
  const { search, reset } = useAdvancedSearch()
  const lucky = useRandomTitle()

  return (
    <div sx={styles.toolbar}>
      <CatchBoundary errorComponent={() => null} getResetKey={() => "count"}>
        <Suspense fallback={<Skeleton sx={styles.countSkeleton} />}>
          <ResultsCount />
        </Suspense>
      </CatchBoundary>
      <div sx={styles.actions}>
        <Button
          disabled={countActiveFilters(search) === 0}
          onClick={() => {
            void reset()
          }}
          size="lg"
          sx={controlStyles.height}
          variant="ghost"
        >
          {m.search_reset_filters()}
        </Button>
        <Button
          loading={lucky.isPending}
          onClick={() => {
            lucky.mutate(search)
          }}
          size="lg"
          sx={controlStyles.height}
          variant="secondary"
        >
          <Shuffle />
          {m.search_lucky()}
        </Button>
        <ViewSwitcher />
      </div>
    </div>
  )
}
