import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"

const styles = stylex.create({
  body: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  block: {
    borderRadius: radius.xxl,
  },
  eyebrow: {
    height: "1rem",
    width: "12rem",
  },
  title: {
    display: "block",
    height: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    width: "min(20rem, 80%)",
  },
})

export function PageTitleSkeleton() {
  return <Skeleton aria-hidden sx={styles.title} />
}

export function PageEyebrowSkeleton() {
  return <Skeleton aria-hidden sx={styles.eyebrow} />
}

export function PageBodySkeleton({ blocks }: { blocks: string[] }) {
  return (
    <div aria-hidden sx={styles.body}>
      {range(0, blocks.length).map((slot) => (
        <Skeleton key={slot} style={{ height: blocks[slot] }} sx={styles.block} />
      ))}
    </div>
  )
}
