import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { hoverCardStyles } from "@/features/users/components/hover-card/user-hover-card-styles"

const styles = stylex.create({
  banner: {
    borderRadius: 0,
  },
  avatar: {
    borderColor: colors.popover,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 3,
  },
  name: {
    height: "1.125rem",
    width: "55%",
  },
  line: {
    height: "0.75rem",
    width: "85%",
  },
  short: {
    height: "0.75rem",
    width: "40%",
  },
})

export function UserHoverCardSkeleton() {
  return (
    <div aria-busy>
      <Skeleton sx={[hoverCardStyles.banner, styles.banner]} />
      <div sx={hoverCardStyles.body}>
        <div sx={hoverCardStyles.avatarRow}>
          <Skeleton sx={[hoverCardStyles.avatar, styles.avatar]} />
        </div>
        <Skeleton sx={styles.name} />
        <Skeleton sx={styles.line} />
        <Skeleton sx={styles.short} />
      </div>
    </div>
  )
}
