import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  skeleton: {
    borderRadius: radius.lg,
    flex: "1",
    minHeight: "12rem",
  },
})

export function CardSkeleton({ sx }: { sx?: Sx }) {
  return <Skeleton sx={[styles.skeleton, sx]} />
}
