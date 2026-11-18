import type { AchievementKey } from "@taiyomoe/db/achievements"
import { ACHIEVEMENTS } from "@taiyomoe/db/achievements"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type Label = () => string

export const ACHIEVEMENT_LABELS: Record<AchievementKey, { name: Label }> = {
  chaptersRead100: { name: m.achievement_chapters_read_100 },
  chaptersRead1000: { name: m.achievement_chapters_read_1000 },
  chaptersRead5000: { name: m.achievement_chapters_read_5000 },
  chaptersUploaded10: { name: m.achievement_chapters_uploaded_10 },
  chaptersUploaded250: { name: m.achievement_chapters_uploaded_250 },
  chaptersUploaded100000: { name: m.achievement_chapters_uploaded_100000 },
  followers25: { name: m.achievement_followers_25 },
  commentsWritten50: { name: m.achievement_comments_written_50 },
  dailyChampion: { name: m.achievement_daily_champion },
  hatTrick: { name: m.achievement_hat_trick },
  unstoppable: { name: m.achievement_unstoppable },
  sovereign: { name: m.achievement_sovereign },
  topTen: { name: m.achievement_top_ten },
  weeklyPodium: { name: m.achievement_weekly_podium },
  weeklyChampion: { name: m.achievement_weekly_champion },
  monthlyPodium: { name: m.achievement_monthly_podium },
  monthlyChampion: { name: m.achievement_monthly_champion },
}

const METRIC_DESCRIPTIONS = {
  chaptersRead: m.achievement_description_chapters_read,
  chaptersUploaded: m.achievement_description_chapters_uploaded,
  followers: m.achievement_description_followers,
  commentsWritten: m.achievement_description_comments_written,
} as const

/** How to earn the achievement, from its criteria. */
export const describeAchievement = (key: AchievementKey) => {
  const { criteria } = ACHIEVEMENTS[key]

  if (criteria.type === "metric") {
    return METRIC_DESCRIPTIONS[criteria.metric]({
      count: criteria.threshold.toLocaleString(getLocale()),
    })
  }

  if (criteria.type === "streak") {
    return m.achievement_description_streak({ count: criteria.days.toLocaleString(getLocale()) })
  }

  const count = criteria.rank.toLocaleString(getLocale())
  const [period] = criteria.periods

  if (criteria.periods.length > 1) {
    return m.achievement_description_top_week_or_month({ count })
  }

  if (criteria.rank === 1) {
    return {
      DAY: m.achievement_description_first_day,
      WEEK: m.achievement_description_first_week,
      MONTH: m.achievement_description_first_month,
    }[period ?? "DAY"]()
  }

  return period === "MONTH"
    ? m.achievement_description_top_month({ count })
    : m.achievement_description_top_week({ count })
}
