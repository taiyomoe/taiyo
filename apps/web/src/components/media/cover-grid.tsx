import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"

import { MediaCardSkeleton } from "@/components/media/media-card"

const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: { default: "1rem", "@media (width >= 48rem)": "1.5rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(auto-fill, minmax(8.5rem, 1fr))",
      "@media (width >= 48rem)": "repeat(auto-fill, minmax(10.5rem, 1fr))",
    },
    rowGap: "2rem",
  },
  item: {
    minWidth: 0,
  },
})

export function CoverGrid({ children }: { children: ReactNode }) {
  return <ul sx={styles.grid}>{children}</ul>
}

export function CoverGridItem({ children }: { children: ReactNode }) {
  return <li sx={styles.item}>{children}</li>
}

export function CoverGridSkeleton({ count }: { count: number }) {
  return (
    <CoverGrid>
      {Array.from({ length: count }, (_, index) => (
        <CoverGridItem key={index}>
          <MediaCardSkeleton />
        </CoverGridItem>
      ))}
    </CoverGrid>
  )
}
