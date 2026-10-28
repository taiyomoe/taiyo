import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { CoverSkeleton } from "@/features/media/components/cover"
import { mediaPageStyles } from "@/features/media/components/media-page/media-page-styles"

const styles = stylex.create({
  skeletonTitle: {
    height: { [breakpoints.lg]: "3rem", default: "1.75rem" },
    width: "min(28rem, 80%)",
  },
  skeletonBadges: {
    height: "1.5rem",
    width: "min(18rem, 60%)",
  },
})

export function MediaPageSkeleton() {
  return (
    <div sx={mediaPageStyles.layout}>
      <aside aria-hidden sx={mediaPageStyles.aside}>
        <div sx={mediaPageStyles.coverSlot}>
          <CoverSkeleton sx={mediaPageStyles.cover} />
        </div>
      </aside>
      <div sx={mediaPageStyles.main}>
        <div aria-hidden sx={mediaPageStyles.header}>
          <Skeleton sx={styles.skeletonTitle} />
          <Skeleton sx={styles.skeletonBadges} />
        </div>
      </div>
    </div>
  )
}
