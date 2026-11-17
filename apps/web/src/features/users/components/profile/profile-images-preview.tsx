import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { PersonAvatar } from "@/features/groups/components/group-avatar"

const styles = stylex.create({
  preview: {
    position: "relative",
    paddingBottom: { default: "2.75rem", [breakpoints.sm]: "3.5rem" },
  },
  banner: {
    borderRadius: radius.xl,
    overflow: "hidden",
    aspectRatio: "3 / 1",
    backgroundColor: colors.muted,
    width: "100%",
  },
  bannerImage: {
    display: "block",
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  avatarFrame: {
    padding: "0.25rem",
    borderRadius: radius.full,
    backgroundColor: colors.card,
    position: "absolute",
    bottom: 0,
    left: { default: "1rem", [breakpoints.sm]: "1.5rem" },
  },
  avatar: {
    height: { default: "5.5rem", [breakpoints.sm]: "7rem" },
    width: { default: "5.5rem", [breakpoints.sm]: "7rem" },
  },
  avatarFallback: {
    fontSize: "2rem",
  },
})

/** The banner of a profile with its avatar over the bottom edge, as the profile page shows them. */
export function ProfileImagesPreview({
  profile,
}: {
  profile: Pick<UserProfile, "id" | "displayUsername" | "image" | "avatarBorder" | "bannerUrl">
}) {
  return (
    <div sx={styles.preview}>
      <div sx={styles.banner}>
        {profile.bannerUrl === null ? null : (
          <img alt="" draggable={false} src={profile.bannerUrl} sx={styles.bannerImage} />
        )}
      </div>
      <div sx={styles.avatarFrame}>
        <PersonAvatar fallbackSx={styles.avatarFallback} person={profile} sx={styles.avatar} />
      </div>
    </div>
  )
}
