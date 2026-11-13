import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"
import type { SearchHit } from "@/features/advanced-search/hooks/use-search-results"
import type { SearchView } from "@/features/advanced-search/lib/advanced-search"
import {
  ResultCard,
  ResultCardSkeleton,
} from "@/features/advanced-search/components/results/result-card"
import {
  ResultRow,
  ResultRowSkeleton,
} from "@/features/advanced-search/components/results/result-row"
import {
  ResultTile,
  ResultTileSkeleton,
} from "@/features/advanced-search/components/results/result-tile"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "grid",
    minWidth: 0,
  },
  cards: {
    gap: "1rem",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "repeat(2, minmax(0, 1fr))",
    },
  },
  rows: {
    gap: "0.75rem",
    gridTemplateColumns: "minmax(0, 1fr)",
  },
  grid: {
    gap: "1rem",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.sm]: {
        default: "repeat(3, minmax(0, 1fr))",
        [breakpoints.md]: {
          default: "repeat(4, minmax(0, 1fr))",
          [breakpoints.xl]: "repeat(6, minmax(0, 1fr))",
        },
      },
    },
  },
  item: {
    display: "grid",
    minWidth: 0,
  },
})
const VIEW_STYLES = { cards: styles.cards, list: styles.rows, grid: styles.grid }

export function ResultList({ hits, view }: { hits: SearchHit[]; view: SearchView }) {
  return (
    <ul sx={[styles.list, VIEW_STYLES[view]]}>
      {hits.map((hit) => (
        <li key={hit.id} sx={styles.item}>
          {view === "cards" ? <ResultCard hit={hit} /> : null}
          {view === "list" ? <ResultRow hit={hit} /> : null}
          {view === "grid" ? <ResultTile hit={hit} /> : null}
        </li>
      ))}
    </ul>
  )
}

export function ResultListSkeleton({ view, count }: { view: SearchView; count: number }) {
  return (
    <ul aria-hidden sx={[styles.list, VIEW_STYLES[view]]}>
      {range(0, count).map((index) => (
        <li key={index} sx={styles.item}>
          {view === "cards" ? <ResultCardSkeleton /> : null}
          {view === "list" ? <ResultRowSkeleton /> : null}
          {view === "grid" ? <ResultTileSkeleton /> : null}
        </li>
      ))}
    </ul>
  )
}
