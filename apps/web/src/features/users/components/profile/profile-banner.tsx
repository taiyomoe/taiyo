import * as stylex from "@stylexjs/stylex"
import { Image } from "@taiyomoe/ui/components/icons"
import {
  breakpoints,
  colors,
  consts,
  motion,
  radius,
  shadows,
} from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { ProfileImageMenu } from "@/features/users/components/profile/profile-image-menu"
import { useProfileImageUpload } from "@/features/users/components/profile/use-profile-image-upload"
import { m } from "@/paraglide/messages"

const TONES = ["#f59e0b", "#f43f5e", "#8b5cf6", "#0ea5e9", "#10b981"]
const styles = stylex.create({
  banner: {
    borderRadius: { default: 0, [breakpoints.md]: radius.xxl },
    overflow: "hidden",
    aspectRatio: "3 / 1",
    backgroundColor: colors.muted,
    boxShadow: { default: "none", [breakpoints.md]: shadows.raised },
    position: "relative",
    maxHeight: "22rem",
    width: "100%",
  },
  image: {
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  placeholder: {
    inset: 0,
    position: "absolute",
  },
  shade: {
    inset: 0,
    backgroundImage: "linear-gradient(to bottom, transparent 55%, rgb(0 0 0 / 28%))",
    pointerEvents: "none",
    position: "absolute",
  },
  change: {
    borderRadius: radius.full,
    borderStyle: "none",
    gap: "0.5rem",
    paddingBlock: "0.5rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    backdropFilter: "blur(12px) saturate(140%)",
    backgroundColor: { default: "rgb(0 0 0 / 45%)", ":hover": "rgb(0 0 0 / 62%)" },
    color: "white",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "0.8125rem",
    fontWeight: 600,
    opacity: {
      default: 0,
      [stylex.when.ancestor(":focus-within")]: 1,
      [stylex.when.ancestor(":hover")]: 1,
      [consts.pointerCoarse]: 1,
      ":is([data-popup-open])": 1,
    },
    outlineColor: "white",
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "absolute",
    transform: {
      default: "translateY(-4px)",
      [stylex.when.ancestor(":focus-within")]: "none",
      [stylex.when.ancestor(":hover")]: "none",
      [consts.pointerCoarse]: "none",
      ":is([data-popup-open])": "none",
    },
    transitionDuration: motion.enter,
    transitionProperty: "opacity, transform, background-color",
    transitionTimingFunction: motion.easeOut,
    right: "0.875rem",
    top: "0.875rem",
  },
})

export function ProfileBanner({ profile, isOwner }: { profile: UserProfile; isOwner: boolean }) {
  const first = Number.parseInt(profile.id.slice(0, 2), 16) % TONES.length
  const second = (first + 2) % TONES.length

  return (
    <div sx={[styles.banner, stylex.defaultMarker()]}>
      {profile.bannerUrl === null ? (
        <div
          aria-hidden
          style={{
            backgroundImage: `radial-gradient(120% 140% at 15% 0%, ${TONES[first]}55, transparent 60%), radial-gradient(120% 140% at 90% 100%, ${TONES[second]}55, transparent 60%)`,
          }}
          sx={styles.placeholder}
        />
      ) : (
        <img
          alt=""
          decoding="async"
          draggable={false}
          fetchPriority="high"
          src={profile.bannerUrl}
          sx={styles.image}
        />
      )}
      <div aria-hidden sx={styles.shade} />
      {isOwner ? <BannerControls profile={profile} /> : null}
    </div>
  )
}

function BannerControls({ profile }: { profile: UserProfile }) {
  const upload = useProfileImageUpload(profile, "banner")

  return (
    <>
      <ProfileImageMenu
        hasImage={profile.bannerUrl !== null}
        label={m.profile_change_banner()}
        onPick={upload.pick}
        onRemove={upload.remove}
        removeLabel={m.profile_remove_banner()}
        sx={styles.change}
      >
        <Image size={16} />
        {m.profile_change_banner()}
      </ProfileImageMenu>
      {upload.element}
    </>
  )
}
