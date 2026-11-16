import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { CoverSkeleton } from "@/features/media/components/cover"

const styles = stylex.create({
  card: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  cover: {
    width: "100%",
  },
  title: {
    height: "1rem",
    width: "80%",
  },
  meta: {
    height: "0.75rem",
    width: "45%",
  },
})

export function LibraryCardSkeleton() {
  return (
    <li aria-hidden sx={styles.card}>
      <CoverSkeleton sx={styles.cover} />
      <Skeleton sx={styles.title} />
      <Skeleton sx={styles.meta} />
    </li>
  )
}
