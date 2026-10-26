import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { featuredStyles } from "@/features/home/components/featured/featured-styles"
import { CoverSkeleton } from "@/features/media/components/cover"

const styles = stylex.create({
  skeletonLines: {
    gap: { default: "0.5rem", "@media (width >= 48rem)": "0.75rem" },
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxWidth: "36rem",
  },
  skeletonTitle: {
    height: { default: "1.5rem", "@media (width >= 48rem)": "2.5rem" },
    width: "70%",
  },
  skeletonAuthors: {
    height: "1rem",
    width: "40%",
  },
  skeletonLine: {
    height: "0.875rem",
    width: "100%",
  },
  skeletonLineShort: {
    height: "0.875rem",
    width: "60%",
  },
})

export function FeaturedSlideSkeleton() {
  return (
    <div aria-hidden sx={featuredStyles.slide}>
      <div sx={featuredStyles.backdrop}>
        <div sx={featuredStyles.shade} />
      </div>
      <div sx={featuredStyles.content}>
        <CoverSkeleton sx={featuredStyles.cover} />
        <div sx={styles.skeletonLines}>
          <Skeleton sx={styles.skeletonTitle} />
          <Skeleton sx={styles.skeletonAuthors} />
          <Skeleton sx={styles.skeletonLine} />
          <Skeleton sx={styles.skeletonLine} />
          <Skeleton sx={styles.skeletonLineShort} />
        </div>
      </div>
    </div>
  )
}
