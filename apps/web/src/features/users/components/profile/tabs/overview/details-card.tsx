import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Calendar, Crown, Globe, Tag, User } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { LazyCountryFlag } from "@/components/flags/lazy-country-flag"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { GENDER_LABELS } from "@/features/users/lib/cosmetic-labels"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  details: {
    margin: 0,
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  detail: {
    gap: "0.75rem",
    alignItems: "flex-start",
    display: "flex",
    fontSize: "0.9375rem",
    justifyContent: "space-between",
    minWidth: 0,
  },
  term: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
  },
  value: {
    margin: 0,
    flexBasis: "0%",
    flexGrow: 1,
    fontWeight: 500,
    overflowWrap: "anywhere",
    textAlign: "end",
    minWidth: 0,
  },
  flag: {
    display: "inline-flex",
    marginInlineEnd: "0.375rem",
    verticalAlign: "-0.125em",
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
      <dt sx={styles.term}>
        {icon}
        {term}
      </dt>
      <dd sx={styles.value}>{children}</dd>
    </div>
  )
}

export function DetailsCard({ profile }: { profile: UserProfile }) {
  const locale = getLocale()
  const country =
    profile.country === null
      ? null
      : new Intl.DisplayNames([locale], { type: "region" }).of(profile.country.toUpperCase())
  const location = [profile.city, country].filter(Boolean).join(", ")

  return (
    <section sx={[profileStyles.card, styles.section]}>
      <h2 sx={profileStyles.sectionTitle}>{m.profile_details()}</h2>
      <dl sx={styles.details}>
        {location === "" ? null : (
          <Detail icon={<Globe size={16} />} term={m.profile_detail_location()}>
            {profile.country === null ? null : (
              <span sx={styles.flag}>
                <LazyCountryFlag country={profile.country} />
              </span>
            )}
            {location}
          </Detail>
        )}
        {profile.birthDate === null ? null : (
          <Detail icon={<Calendar size={16} />} term={m.profile_detail_birthday()}>
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
          <Detail icon={<User size={16} />} term={m.profile_detail_gender()}>
            {GENDER_LABELS[profile.gender]()}
          </Detail>
        )}
        <Detail icon={<Calendar size={16} />} term={m.profile_detail_joined()}>
          {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
            new Date(profile.createdAt),
          )}
        </Detail>
        {profile.role === "USER" ? null : (
          <Detail icon={<Crown size={16} />} term={m.profile_detail_role()}>
            {ROLE_LABELS[profile.role]()}
          </Detail>
        )}
        {profile.title === null ? null : (
          <Detail icon={<Tag size={16} />} term={m.profile_detail_title()}>
            <TitleBadge size="sm" title={profile.title} />
          </Detail>
        )}
      </dl>
    </section>
  )
}
