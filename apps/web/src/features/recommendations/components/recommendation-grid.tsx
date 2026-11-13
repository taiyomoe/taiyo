import type { ReactNode, Ref } from "react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"
import { RecommendationCardSkeleton } from "@/features/recommendations/components/recommendation-card"

const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: { default: "0.75rem", [breakpoints.sm]: "1rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(auto-fill, minmax(6.5rem, 1fr))",
      [breakpoints.sm]: "repeat(auto-fill, minmax(9rem, 1fr))",
    },
    rowGap: { default: "1.25rem", [breakpoints.sm]: "1.5rem" },
  },
  shelf: {
    margin: 0,
    padding: 0,
    gap: { default: "0.75rem", [breakpoints.sm]: "1rem" },
    listStyle: "none",
    scrollSnapType: "x mandatory",
    display: "grid",
    gridAutoColumns: { default: "6.5rem", [breakpoints.sm]: "9rem" },
    gridAutoFlow: "column",
    scrollbarWidth: "none",
    overflowX: "auto",
    paddingBottom: "0.25rem",
  },
  item: {
    scrollSnapAlign: "start",
    minWidth: 0,
  },
})

export function RecommendationGrid({
  layout = "grid",
  children,
  ref,
}: {
  layout?: "grid" | "shelf"
  children: ReactNode
  ref?: Ref<HTMLUListElement>
}) {
  return (
    <ul ref={ref} sx={layout === "grid" ? styles.grid : styles.shelf}>
      {children}
    </ul>
  )
}

export function RecommendationGridItem({ children }: { children: ReactNode }) {
  return <li sx={styles.item}>{children}</li>
}

export function RecommendationGridSkeleton({
  layout = "grid",
  count = 12,
}: {
  layout?: "grid" | "shelf"
  count?: number
}) {
  return (
    <RecommendationGrid layout={layout}>
      {range(0, count).map((index) => (
        <RecommendationGridItem key={index}>
          <RecommendationCardSkeleton />
        </RecommendationGridItem>
      ))}
    </RecommendationGrid>
  )
}
