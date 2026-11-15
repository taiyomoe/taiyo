import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { UpdateSearch } from "@/features/activity-log/hooks/use-activity-log"
import type { ActivityLogSearch } from "@/features/activity-log/lib/activity-log"
import { PagePagination } from "@/components/pagination/page-pagination"
import { ResultsHeader } from "@/features/activity-log/components/page/results-header"
import { withoutDefaults } from "@/features/activity-log/lib/activity-log-search"

const styles = stylex.create({
  results: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
    minWidth: 0,
  },
  pagination: {
    paddingBlock: "1rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
})

export function ResultsCard({
  children,
  entryCount,
  grouping,
  loaded,
  page,
  pageCount,
  rangeLabel,
  search,
  total,
  onUpdate,
}: {
  children: ReactNode
  entryCount: number
  grouping: boolean
  loaded: boolean
  page: number
  pageCount: number
  rangeLabel: string
  search: ActivityLogSearch
  total: number
  onUpdate: UpdateSearch
}) {
  return (
    <Card render={<section />} sx={styles.results}>
      <ResultsHeader
        entryCount={entryCount}
        grouping={grouping}
        loaded={loaded}
        onUpdate={onUpdate}
        page={page}
        rangeLabel={rangeLabel}
        total={total}
      />
      {children}
      {pageCount > 1 ? (
        <div sx={styles.pagination}>
          <PagePagination
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
        </div>
      ) : null}
    </Card>
  )
}
