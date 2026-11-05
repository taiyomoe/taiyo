import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { LazyCountryFlag } from "@/components/flags/lazy-country-flag"
import { sceneFont } from "@/components/scene/scene.stylex"
import { UserName } from "@/components/user-name/user-name"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  name: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.625rem", [breakpoints.sm]: "2.25rem", [breakpoints.lg]: "3rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    overflowWrap: "anywhere",
  },
  badges: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  meta: {
    alignItems: "center",
    color: colors.mutedForeground,
    columnGap: "0.875rem",
    display: "flex",
    flexWrap: "wrap",
    fontSize: { default: "0.8125rem", [breakpoints.sm]: "0.9375rem" },
    rowGap: "0.25rem",
  },
  location: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
  },
  hideOnPhone: {
    display: { default: "none", [breakpoints.sm]: "inline-flex" },
  },
})

export function ProfileHeader({ profile }: { profile: UserProfile }) {
  const joined = new Intl.DateTimeFormat(getLocale(), { month: "long", year: "numeric" }).format(
    new Date(profile.createdAt),
  )
  const country =
    profile.country === null
      ? null
      : new Intl.DisplayNames([getLocale()], { type: "region" }).of(profile.country.toUpperCase())
  const location = [profile.city, country].filter(Boolean).join(", ")

  return (
    <header sx={profileStyles.header}>
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
      <div sx={styles.meta}>
        <span>@{profile.username}</span>
        {location === "" ? null : (
          <span sx={styles.location}>
            {profile.country === null ? null : <LazyCountryFlag country={profile.country} />}
            {location}
          </span>
        )}
        <span sx={styles.hideOnPhone}>{m.profile_joined({ date: joined })}</span>
      </div>
    </header>
  )
}
