import * as stylex from "@stylexjs/stylex"
import { Calendar, Globe } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import type { Session } from "@/lib/session"
import { LazyCountryFlag } from "@/components/flags/lazy-country-flag"
import { UserName } from "@/components/user-name/user-name"
import { ProfileActions } from "@/features/users/components/profile/profile-actions"
import { ProfileAvatar } from "@/features/users/components/profile/profile-avatar"
import { ProfileStats } from "@/features/users/components/profile/profile-stats"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  header: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  top: {
    gap: "1rem",
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
  },
  avatar: {
    flexShrink: 0,
    position: "relative",
    zIndex: 1,
    marginTop: { default: "-3rem", [breakpoints.md]: "-4.25rem" },
  },
  actions: {
    paddingTop: "0.875rem",
  },
  identity: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  nameRow: {
    alignItems: "center",
    columnGap: "0.75rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.5rem",
  },
  name: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    overflowWrap: "anywhere",
  },
  badges: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  meta: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    alignItems: "center",
    color: colors.mutedForeground,
    columnGap: "1.25rem",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.9375rem",
    rowGap: "0.375rem",
  },
  handle: {
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    overflowWrap: "anywhere",
    marginTop: "-0.25rem",
  },
  metaItem: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
    minWidth: 0,
  },
  metaText: {
    overflowWrap: "anywhere",
    minWidth: 0,
  },
})

export function ProfileHeader({
  profile,
  viewer,
}: {
  profile: UserProfile
  viewer: Session["user"] | null
}) {
  const locale = getLocale()
  const joined = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(profile.createdAt),
  )
  const country =
    profile.country === null
      ? null
      : new Intl.DisplayNames([locale], { type: "region" }).of(profile.country.toUpperCase())
  const location = [profile.city, country].filter(Boolean).join(", ")

  return (
    <header sx={styles.header}>
      <div sx={styles.top}>
        <div sx={styles.avatar}>
          <ProfileAvatar isOwner={viewer?.id === profile.id} profile={profile} />
        </div>
        <div sx={styles.actions}>
          <ProfileActions profile={profile} viewer={viewer} />
        </div>
      </div>
      <div sx={styles.identity}>
        <div sx={styles.nameRow}>
          <h1 sx={styles.name}>
            <UserName effect={profile.nameEffect} name={profile.displayUsername} />
          </h1>
          <div sx={styles.badges}>
            <TitleBadge title={profile.title} />
            {profile.role === "USER" ? null : (
              <Badge variant="outline">{ROLE_LABELS[profile.role]()}</Badge>
            )}
            {profile.followsViewer === true ? (
              <Badge variant="secondary">{m.profile_follows_you()}</Badge>
            ) : null}
          </div>
        </div>
        <span sx={styles.handle}>@{profile.username}</span>
        <ul sx={styles.meta}>
          {location === "" ? null : (
            <li sx={styles.metaItem}>
              {profile.country === null ? (
                <Globe size={16} />
              ) : (
                <LazyCountryFlag country={profile.country} />
              )}
              <span sx={styles.metaText}>{location}</span>
            </li>
          )}
          <li sx={styles.metaItem}>
            <Calendar size={16} />
            <span sx={styles.metaText}>{m.profile_joined({ date: joined })}</span>
          </li>
        </ul>
        <ProfileStats profile={profile} />
      </div>
    </header>
  )
}
