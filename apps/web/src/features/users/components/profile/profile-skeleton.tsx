import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { profileStyles } from "@/features/users/components/profile/profile-styles"

const styles = stylex.create({
  banner: {
    borderRadius: 0,
    aspectRatio: "3 / 1",
    maxHeight: "18rem",
    width: "100%",
  },
  header: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  avatarFrame: {
    padding: "0.25rem",
    borderRadius: radius.full,
    backgroundColor: colors.background,
    display: "inline-block",
    position: "relative",
    zIndex: 1,
    marginTop: { default: "-3rem", [breakpoints.md]: "-4.25rem" },
    width: "fit-content",
  },
  avatar: {
    borderRadius: radius.full,
    height: { default: "5.5rem", [breakpoints.md]: "8rem" },
    width: { default: "5.5rem", [breakpoints.md]: "8rem" },
  },
  name: {
    height: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    width: "min(18rem, 70%)",
  },
  line: {
    height: "1rem",
    width: "min(24rem, 85%)",
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
      <div sx={profileStyles.container}>
        <div sx={styles.header}>
          <span sx={styles.avatarFrame}>
            <Skeleton sx={styles.avatar} />
          </span>
          <Skeleton sx={styles.name} />
          <Skeleton sx={styles.line} />
          <Skeleton sx={styles.line} />
        </div>
        <Skeleton sx={styles.tabs} />
      </div>
    </div>
  )
}
