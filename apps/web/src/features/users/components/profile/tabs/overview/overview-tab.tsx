import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { type UserProfile, userStatsQueryOptions } from "@/features/users/api/profile"
import { ProfileGroups } from "@/features/users/components/profile/profile-groups"
import { AboutCard } from "@/features/users/components/profile/tabs/overview/about-card"
import { DetailsCard } from "@/features/users/components/profile/tabs/overview/details-card"
import { LevelCard } from "@/features/users/components/profile/tabs/overview/level-card"
import { ReadingHighlights } from "@/features/users/components/profile/tabs/overview/reading-highlights"
import { RecentReading } from "@/features/users/components/profile/tabs/overview/recent-reading"
import { useSettings } from "@/lib/settings"

const styles = stylex.create({
  root: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  grid: {
    gap: "1.25rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "minmax(0, 1fr) 20rem",
    },
  },
  column: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
})

export function OverviewTab({ profile, isOwner }: { profile: UserProfile; isOwner: boolean }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: stats } = useSuspenseQuery(userStatsQueryOptions(profile.id, contentRatings))

  return (
    <div sx={styles.root}>
      {stats.reading === null ? null : (
        <ReadingHighlights library={stats.library} reading={stats.reading} />
      )}
      <div sx={styles.grid}>
        <div sx={styles.column}>
          <LevelCard profile={profile} />
          <RecentReading profile={profile} />
        </div>
        <div sx={styles.column}>
          <AboutCard isOwner={isOwner} profile={profile} />
          <ProfileGroups groups={profile.groups} />
          <DetailsCard profile={profile} />
        </div>
      </div>
    </div>
  )
}
