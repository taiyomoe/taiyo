import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Calendar, Crown, Globe, Sparkles, Tag, User } from "@taiyomoe/ui/components/icons"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { LazyCountryFlag } from "@/components/flags/lazy-country-flag"
import { ProfileGroups } from "@/features/users/components/profile/profile-groups"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { GENDER_LABELS } from "@/features/users/lib/cosmetic-labels"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  grid: {
    gap: "1.25rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.xl]: "minmax(0, 1fr) 20rem",
    },
  },
  column: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  about: {
    margin: 0,
    fontSize: "1rem",
    lineHeight: 1.65,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  details: {
    margin: 0,
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  detail: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  term: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontSize: "0.875rem",
    minWidth: "5.5rem",
  },
  value: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.9375rem",
    fontWeight: 550,
    minWidth: 0,
  },
  points: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
})
const getAge = (birthDate: string) => {
  const birth = new Date(`${birthDate}T00:00:00Z`)
  const now = new Date()
  const hadBirthday =
    now.getUTCMonth() > birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() >= birth.getUTCDate())

  return now.getUTCFullYear() - birth.getUTCFullYear() - (hadBirthday ? 0 : 1)
}

function Detail({ icon, term, children }: { icon: ReactNode; term: string; children: ReactNode }) {
  return (
    <div sx={styles.detail}>
      <span aria-hidden sx={styles.icon}>
        {icon}
      </span>
      <dt sx={styles.term}>{term}</dt>
      <dd sx={styles.value}>{children}</dd>
    </div>
  )
}

export function AboutTab({ profile, isOwner }: { profile: UserProfile; isOwner: boolean }) {
  const locale = getLocale()
  const about =
    profile.about[locale] ??
    profile.about.en ??
    Object.values(profile.about).find((value) => value !== "")
  const country =
    profile.country === null
      ? null
      : new Intl.DisplayNames([locale], { type: "region" }).of(profile.country.toUpperCase())
  const location = [profile.city, country].filter(Boolean).join(", ")

  return (
    <div sx={styles.grid}>
      <div sx={styles.column}>
        <section sx={[profileStyles.card, styles.section]}>
          <h2 sx={profileStyles.sectionTitle}>{m.profile_about()}</h2>
          {about === undefined || about === "" ? (
            <p sx={profileStyles.empty}>
              {isOwner
                ? m.profile_about_empty_self()
                : m.profile_about_empty({ name: profile.displayUsername })}
            </p>
          ) : (
            <p sx={styles.about}>{about}</p>
          )}
        </section>
        <section sx={styles.section}>
          <h2 sx={profileStyles.sectionTitle}>{m.profile_groups()}</h2>
          <ProfileGroups groups={profile.groups} />
        </section>
      </div>
      <section sx={[profileStyles.card, styles.section]}>
        <h2 sx={profileStyles.sectionTitle}>{m.profile_details()}</h2>
        <dl sx={styles.details}>
          {location === "" ? null : (
            <Detail icon={<Globe size={18} />} term={m.profile_detail_location()}>
              {profile.country === null ? null : <LazyCountryFlag country={profile.country} />}
              {location}
            </Detail>
          )}
          {profile.birthDate === null ? null : (
            <Detail icon={<Calendar size={18} />} term={m.profile_detail_birthday()}>
              {new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long",
                timeZone: "UTC",
              }).format(new Date(`${profile.birthDate}T00:00:00Z`))}
              {" · "}
              {m.profile_detail_age({ age: getAge(profile.birthDate) })}
            </Detail>
          )}
          {profile.gender === "NOT_SPECIFIED" ? null : (
            <Detail icon={<User size={18} />} term={m.profile_detail_gender()}>
              {GENDER_LABELS[profile.gender]()}
            </Detail>
          )}
          <Detail icon={<Calendar size={18} />} term={m.profile_detail_joined()}>
            {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
              new Date(profile.createdAt),
            )}
          </Detail>
          {profile.role === "USER" ? null : (
            <Detail icon={<Crown size={18} />} term={m.profile_detail_role()}>
              {ROLE_LABELS[profile.role]()}
            </Detail>
          )}
          {profile.title === null ? null : (
            <Detail icon={<Tag size={18} />} term={m.profile_detail_title()}>
              <TitleBadge size="sm" title={profile.title} />
            </Detail>
          )}
          <Detail icon={<Sparkles size={18} />} term={m.profile_detail_points()}>
            <span sx={styles.points}>{profile.points.toLocaleString(locale)}</span>
          </Detail>
        </dl>
      </section>
    </div>
  )
}
