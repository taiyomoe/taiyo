import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { profileStyles } from "@/features/users/components/profile/profile-styles"

const styles = stylex.create({
  banner: {
    borderRadius: 0,
    aspectRatio: "3 / 1",
    maxHeight: "22rem",
    width: "100%",
  },
  avatarFrame: {
    padding: { default: "0.25rem", [breakpoints.lg]: "0.375rem" },
    borderRadius: radius.full,
    backgroundColor: colors.background,
    display: "inline-block",
  },
  avatar: {
    borderRadius: radius.full,
    height: { default: "6rem", [breakpoints.lg]: "11rem" },
    width: { default: "6rem", [breakpoints.lg]: "11rem" },
  },
  name: {
    height: { default: "1.75rem", [breakpoints.lg]: "2.75rem" },
    width: "min(20rem, 80%)",
  },
  badges: {
    height: "1.25rem",
    width: "min(12rem, 60%)",
  },
  counts: {
    borderRadius: radius.xl,
    height: "4rem",
  },
  tabs: {
    height: "2.5rem",
    width: "min(24rem, 100%)",
  },
})

export function ProfileSkeleton() {
  return (
    <div aria-hidden sx={profileStyles.root}>
      <Skeleton sx={styles.banner} />
      <div sx={profileStyles.layout}>
        <aside sx={profileStyles.aside}>
          <div sx={profileStyles.avatarSlot}>
            <span sx={styles.avatarFrame}>
              <Skeleton sx={styles.avatar} />
            </span>
          </div>
          <div sx={profileStyles.actionsSlot}>
            <Skeleton sx={styles.counts} />
          </div>
        </aside>
        <div sx={profileStyles.main}>
          <div sx={profileStyles.header}>
            <Skeleton sx={styles.name} />
            <Skeleton sx={styles.badges} />
          </div>
          <div sx={profileStyles.tabsSlot}>
            <Skeleton sx={styles.tabs} />
          </div>
        </div>
      </div>
    </div>
  )
}
