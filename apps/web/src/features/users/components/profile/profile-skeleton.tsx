import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  header: {
    gap: "1.25rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: radius.full,
    flexShrink: 0,
    height: "5.5rem",
    width: "5.5rem",
  },
  lines: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    width: "16rem",
  },
  name: {
    height: "2.25rem",
  },
  meta: {
    height: "1rem",
    width: "60%",
  },
})

export function ProfileSkeleton() {
  return (
    <div sx={styles.header}>
      <Skeleton sx={styles.avatar} />
      <div sx={styles.lines}>
        <Skeleton sx={styles.name} />
        <Skeleton sx={styles.meta} />
      </div>
    </div>
  )
}
