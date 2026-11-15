import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { ChapterListSkeleton } from "@/features/chapters/components/chapter-list"
import { CoverSkeleton } from "@/features/media/components/cover"
import { mediaPageStyles } from "@/features/media/components/media-page/media-page-styles"
import { mediaSidebarStyles } from "@/features/media/components/media-sidebar/media-sidebar-styles"

const styles = stylex.create({
  root: {
    width: "100%",
  },
  actionsSlot: {
    gridColumnEnd: "actions",
    gridColumnStart: "actions",
    gridRowEnd: "actions",
    gridRowStart: "actions",
  },
  button: {
    borderRadius: radius.full,
    height: "2.75rem",
  },
  eyebrow: {
    display: { default: "none", [breakpoints.sm]: "block" },
    height: "0.75rem",
    width: "min(16rem, 50%)",
  },
  title: {
    height: {
      default: "1.75rem",
      [breakpoints.sm]: { default: "2.5rem", [breakpoints.lg]: "3.5rem" },
    },
    width: "min(32rem, 85%)",
  },
  badges: {
    height: "1.5rem",
    width: "min(18rem, 60%)",
  },
  tabs: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gridColumnEnd: "tabs",
    gridColumnStart: "tabs",
    gridRowEnd: "tabs",
    gridRowStart: "tabs",
    minWidth: 0,
  },
  tabList: {
    height: "2.25rem",
    width: "min(36rem, 100%)",
  },
  toolbar: {
    borderRadius: radius.full,
    height: "2.5rem",
  },
})

export function MediaPageSkeleton() {
  return (
    <div aria-hidden sx={styles.root}>
      <div sx={mediaPageStyles.layout}>
        <aside sx={mediaPageStyles.aside}>
          <div sx={mediaPageStyles.coverSlot}>
            <CoverSkeleton sx={mediaPageStyles.cover} />
          </div>
          <div sx={[mediaSidebarStyles.actions, styles.actionsSlot]}>
            <Skeleton sx={styles.button} />
            <Skeleton sx={styles.button} />
          </div>
        </aside>
        <div sx={mediaPageStyles.main}>
          <div sx={mediaPageStyles.header}>
            <Skeleton sx={styles.eyebrow} />
            <Skeleton sx={styles.title} />
            <Skeleton sx={styles.badges} />
          </div>
          <div sx={styles.tabs}>
            <Skeleton sx={styles.tabList} />
            <Skeleton sx={styles.toolbar} />
            <ChapterListSkeleton count={6} />
          </div>
        </div>
      </div>
    </div>
  )
}
