import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import { userProfileQueryOptions } from "@/features/users/api/profile"
import { ProfileGroups } from "@/features/users/components/profile/profile-groups"
import { ProfileHeader } from "@/features/users/components/profile/profile-header"
import { useProfileCommands } from "@/features/users/hooks/use-profile-commands"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  about: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "1rem",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
    maxWidth: "48rem",
  },
})

export function ProfileContent({
  username,
  viewer,
}: {
  username: string
  viewer: Session["user"] | null
}) {
  const { data: profile } = useSuspenseQuery(userProfileQueryOptions(username))
  const about =
    profile.about[getLocale()] ??
    profile.about.en ??
    Object.values(profile.about).find((value) => value !== "")

  useProfileCommands(profile, viewer)

  return (
    <>
      <ProfileHeader profile={profile} viewer={viewer} />
      {about === undefined || about === "" ? null : <p sx={styles.about}>{about}</p>}
      <section sx={styles.section}>
        <h2 sx={styles.title}>{m.profile_groups()}</h2>
        <ProfileGroups groups={profile.groups} />
      </section>
    </>
  )
}
