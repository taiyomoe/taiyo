import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Frame, FrameFooter } from "@taiyomoe/ui/components/ui/frame"
import { Link } from "@tanstack/react-router"
import type { UpdateSearch } from "@/features/activity-log/hooks/use-activity-log"
import type { ActivityLogSearch } from "@/features/activity-log/lib/activity-log"
import { PagePagination } from "@/components/pagination/page-pagination"
import { ResultsHeader } from "@/features/activity-log/components/page/results-header"
import { ACTIVITY_LOG_PER_PAGE } from "@/features/activity-log/lib/activity-log"
import { withoutDefaults } from "@/features/activity-log/lib/activity-log-search"
import { formatCount } from "@/features/activity-log/lib/format"
import { SkeletonText } from "@/features/catalog/components/shared/catalog-skeletons"
import { CatalogFooter } from "@/features/catalog/components/shared/catalog-table"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  results: {
    containerType: "inline-size",
    minWidth: 0,
  },
  // The footer of a loading catalog table.
  pending: {
    paddingBlock: "0.75rem",
    paddingInline: "0.75rem",
  },
})

export function ResultsCard({
  children,
  blocked,
  grouping,
  entryCount,
  loaded,
  page,
  pageCount,
  rangeLabel,
  search,
  total,
  onUpdate,
}: {
  children: ReactNode
  blocked: boolean
  grouping: boolean
  entryCount: number
  loaded: boolean
  page: number
  pageCount: number
  rangeLabel: string
  search: ActivityLogSearch
  total: number
  onUpdate: UpdateSearch
}) {
  const range = {
    start: formatCount((page - 1) * ACTIVITY_LOG_PER_PAGE + 1),
    end: formatCount(Math.min(page * ACTIVITY_LOG_PER_PAGE, total)),
    total: formatCount(total),
  }
  let footer: ReactNode = (
    <FrameFooter sx={styles.pending}>
      <SkeletonText width="6rem" />
    </FrameFooter>
  )

  if (blocked) {
    footer = null
  } else if (loaded) {
    let count = grouping ? m.activity_results_groups(range) : m.activity_results_range(range)

    if (total === 0) {
      count = m.catalog_results({ count: formatCount(0) })
    }

    footer = (
      <CatalogFooter total={count}>
        <PagePagination
          fit="container"
          onJump={(target) => {
            onUpdate({ page: target }, { keepPage: true })
          }}
          page={page}
          pageCount={pageCount}
          renderLink={(target) => (
            <Link
              resetScroll={false}
              search={withoutDefaults({ ...search, page: target })}
              to="/dashboard/activity-log"
            />
          )}
        />
      </CatalogFooter>
    )
  }

  return (
    <section sx={styles.results}>
      <Frame>
        <ResultsHeader
          entryCount={entryCount}
          grouping={grouping}
          loaded={loaded}
          onUpdate={onUpdate}
          rangeLabel={rangeLabel}
        />
        {children}
        {footer}
      </Frame>
    </section>
  )
}
