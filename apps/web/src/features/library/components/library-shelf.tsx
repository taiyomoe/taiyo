import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { Navigate } from "@tanstack/react-router"
import { range } from "remeda"
import type { LibraryCounts } from "@/features/library/api/library"
import { LibraryCard } from "@/features/library/components/library-card"
import { LibraryCardSkeleton } from "@/features/library/components/library-card-skeleton"
import { LibraryEmpty } from "@/features/library/components/library-empty"
import { LibraryError } from "@/features/library/components/library-error"
import { LibraryPagination } from "@/features/library/components/library-pagination"
import { LibrarySearchField } from "@/features/library/components/library-search-field"
import { LibrarySortSelect } from "@/features/library/components/library-sort-select"
import { LibraryStatusTabs } from "@/features/library/components/library-status-tabs"
import { useLibraryQuery } from "@/features/library/hooks/use-library-query"
import { LIBRARY_PER_PAGE } from "@/features/library/lib/library-search"

const styles = stylex.create({
  view: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  controls: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  toolbar: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: { default: "0.875rem", [breakpoints.sm]: "1.25rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(auto-fill, minmax(7.5rem, 1fr))",
      [breakpoints.sm]: "repeat(auto-fill, minmax(10rem, 1fr))",
    },
    rowGap: { default: "1.5rem", [breakpoints.sm]: "2rem" },
    transitionDuration: "150ms",
    transitionProperty: "opacity",
  },
  stale: {
    opacity: 0.6,
  },
})

export function LibraryShelf({ counts }: { counts: LibraryCounts | undefined }) {
  const { search, page, query, pageCount } = useLibraryQuery()
  const entries = query.data?.data
  const failed = query.isError && entries === undefined
  const empty = entries?.length === 0

  if (query.data !== undefined && !query.isPlaceholderData && page > Math.max(pageCount, 1)) {
    return (
      <Navigate
        replace
        search={{ ...search, page: pageCount > 1 ? pageCount : undefined }}
        to="/library"
      />
    )
  }

  return (
    <div sx={styles.view}>
      <div sx={styles.controls}>
        <LibraryStatusTabs counts={counts} />
        <div sx={styles.toolbar}>
          <LibrarySearchField />
          <LibrarySortSelect />
        </div>
      </div>
      {failed ? <LibraryError onRetry={() => void query.refetch()} /> : null}
      {empty ? <LibraryEmpty query={search.q ?? ""} status={search.status} /> : null}
      {failed || empty ? null : (
        <ul sx={[styles.grid, query.isPlaceholderData && styles.stale]}>
          {entries === undefined
            ? range(0, LIBRARY_PER_PAGE / 2).map((index) => <LibraryCardSkeleton key={index} />)
            : entries.map((entry, index) => (
                <LibraryCard
                  eager={index < 6}
                  entry={entry}
                  key={entry.mediaId}
                  showStatus={search.status === undefined}
                />
              ))}
        </ul>
      )}
      <LibraryPagination page={page} pageCount={pageCount} />
    </div>
  )
}
