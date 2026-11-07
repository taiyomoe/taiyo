import * as stylex from "@stylexjs/stylex"
import { Edit, Image } from "@taiyomoe/ui/components/icons"
import { breakpoints, colors, consts, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { ProfileImageMenu } from "@/features/users/components/profile/profile-image-menu"
import { useProfileImageUpload } from "@/features/users/components/profile/use-profile-image-upload"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  frame: {
    padding: "0.25rem",
    borderRadius: radius.full,
    backgroundColor: colors.background,
    display: "inline-block",
    position: "relative",
  },
  avatar: {
    height: { default: "5.5rem", [breakpoints.md]: "8rem" },
    width: { default: "5.5rem", [breakpoints.md]: "8rem" },
  },
  fallback: {
    fontSize: { default: "2rem", [breakpoints.md]: "3rem" },
  },
  overlay: {
    inset: "0.25rem",
    borderRadius: radius.full,
    borderStyle: "none",
    gap: "0.375rem",
    alignItems: "center",
    backgroundColor: "rgb(0 0 0 / 52%)",
    color: "white",
    cursor: "pointer",
    display: { default: "flex", [consts.pointerCoarse]: "none" },
    flexDirection: "column",
    fontSize: "0.8125rem",
    fontWeight: 600,
    justifyContent: "center",
    opacity: {
      default: 0,
      ":focus-visible": 1,
      ":is([data-popup-open])": 1,
      ":hover": 1,
    },
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "absolute",
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
    transitionTimingFunction: motion.easeOut,
  },
  overlayIcon: {
    transform: { default: "scale(0.85)", ":is(:hover > *)": "scale(1)" },
    transitionDuration: motion.enter,
    transitionProperty: "transform",
  },
  badge: {
    borderColor: colors.background,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 3,
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: { default: "none", [consts.pointerCoarse]: "flex" },
    justifyContent: "center",
    position: "absolute",
    bottom: { default: "0", [breakpoints.md]: "0.375rem" },
    height: "2rem",
    right: { default: "0", [breakpoints.md]: "0.375rem" },
    width: "2rem",
  },
})

export function ProfileAvatar({ profile, isOwner }: { profile: UserProfile; isOwner: boolean }) {
  return (
    <div sx={styles.frame}>
      <PersonAvatar fallbackSx={styles.fallback} person={profile} sx={styles.avatar} />
      {isOwner ? <AvatarControls profile={profile} /> : null}
    </div>
  )
}

function AvatarControls({ profile }: { profile: UserProfile }) {
  const upload = useProfileImageUpload(profile, "avatar")

  return (
    <>
      <ProfileImageMenu
        hasImage={profile.image !== null}
        label={m.profile_change_avatar()}
        onPick={upload.pick}
        onRemove={upload.remove}
        removeLabel={m.profile_remove_avatar()}
        sx={styles.overlay}
      >
        <Image size={22} sx={styles.overlayIcon} />
        {m.profile_change_avatar()}
      </ProfileImageMenu>
      <ProfileImageMenu
        hasImage={profile.image !== null}
        label={m.profile_change_avatar()}
        onPick={upload.pick}
        onRemove={upload.remove}
        removeLabel={m.profile_remove_avatar()}
        sx={styles.badge}
      >
        <Edit size={16} />
      </ProfileImageMenu>
      {upload.element}
    </>
  )
}
