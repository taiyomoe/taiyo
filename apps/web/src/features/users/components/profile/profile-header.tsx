import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import type { Session } from "@/lib/session"
import { sceneFont } from "@/components/scene/scene.stylex"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { FollowButton } from "@/features/users/components/profile/follow-button"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  header: {
    gap: "1.5rem",
    alignItems: { default: "flex-start", [breakpoints.lg]: "center" },
    display: "flex",
    flexDirection: { default: "column", [breakpoints.lg]: "row" },
  },
  identity: {
    gap: "1.25rem",
    alignItems: "center",
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
  },
  avatar: {
    height: "5.5rem",
    width: "5.5rem",
  },
  avatarFallback: {
    fontSize: "2rem",
  },
  titles: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  nameRow: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  name: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "2rem", [breakpoints.md]: "2.75rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    overflowWrap: "anywhere",
  },
  meta: {
    color: colors.mutedForeground,
    columnGap: "1rem",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.9375rem",
    rowGap: "0.375rem",
  },
  count: {
    color: colors.foreground,
    fontWeight: 600,
  },
})

export function ProfileHeader({
  profile,
  viewer,
}: {
  profile: UserProfile
  viewer: Session["user"] | null
}) {
  const joined = new Intl.DateTimeFormat(getLocale(), { month: "long", year: "numeric" }).format(
    new Date(profile.createdAt),
  )

  return (
    <div sx={styles.header}>
      <div sx={styles.identity}>
        <PersonAvatar fallbackSx={styles.avatarFallback} person={profile} sx={styles.avatar} />
        <div sx={styles.titles}>
          <div sx={styles.nameRow}>
            <h1 sx={styles.name}>{profile.displayUsername}</h1>
            {profile.role === "USER" ? null : (
              <Badge variant="outline">{ROLE_LABELS[profile.role]()}</Badge>
            )}
          </div>
          <div sx={styles.meta}>
            <span>@{profile.username}</span>
            <span>{m.profile_joined({ date: joined })}</span>
            <span>
              <span sx={styles.count}>{profile.followerCount}</span>{" "}
              {profile.followerCount === 1 ? m.profile_follower() : m.profile_followers()}
            </span>
            <span>
              <span sx={styles.count}>{profile.followingCount}</span> {m.profile_following()}
            </span>
          </div>
        </div>
      </div>
      {viewer === null || viewer.id === profile.id ? null : <FollowButton profile={profile} />}
    </div>
  )
}
