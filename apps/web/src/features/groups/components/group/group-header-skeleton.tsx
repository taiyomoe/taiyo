import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  identity: {
    gap: "1.25rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: radius.lg,
    flexShrink: 0,
    height: "5.5rem",
    width: "5.5rem",
  },
  titles: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  name: {
    height: { default: "2.25rem", [breakpoints.md]: "3rem" },
    width: "min(20rem, 70%)",
  },
  badge: {
    borderRadius: "999px",
    height: "1.25rem",
    width: "5.5rem",
  },
})

export function GroupHeaderSkeleton() {
  return (
    <div aria-hidden sx={styles.identity}>
      <Skeleton sx={styles.avatar} />
      <div sx={styles.titles}>
        <Skeleton sx={styles.name} />
        <Skeleton sx={styles.badge} />
      </div>
    </div>
  )
}
