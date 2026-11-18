import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { ACHIEVEMENT_CATEGORIES } from "@taiyomoe/db/achievements"
import { isAvatarBorder, isNameEffect, isUserTitle } from "@taiyomoe/db/cosmetics"
import { BookOpen, Comment, Lock, Trophy, Upload } from "@taiyomoe/ui/components/icons"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Meter, MeterIndicator, MeterTrack } from "@taiyomoe/ui/components/ui/meter"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { range } from "remeda"
import type { UserAchievement, UserProfile } from "@/features/users/api/profile"
import { UserName } from "@/components/user-name/user-name"
import { ItemPreview } from "@/features/shop/components/items/item-preview"
import { PointsAmount } from "@/features/shop/components/points-amount"
import { userAchievementsQueryOptions } from "@/features/users/api/profile"
import { RARITY_STYLES } from "@/features/users/components/profile/rarity-styles"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { ACHIEVEMENT_LABELS, describeAchievement } from "@/features/users/lib/achievement-labels"
import { AVATAR_BORDER_LABELS, RARITY_LABELS } from "@/features/users/lib/cosmetic-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type Category = UserAchievement["category"]

const CATEGORIES = {
  reading: { icon: BookOpen, label: m.achievements_category_reading },
  uploading: { icon: Upload, label: m.achievements_category_uploading },
  community: { icon: Comment, label: m.achievements_category_community },
  ranking: { icon: Trophy, label: m.achievements_category_ranking },
} satisfies Record<Category, { icon: (props: IconProps) => ReactElement; label: () => string }>
const styles = stylex.create({
  root: {
    gap: "2rem",
    display: "flex",
    flexDirection: "column",
  },
  summary: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionHead: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
  },
  sectionIcon: {
    color: colors.mutedForeground,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 650,
  },
  sectionCount: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
  },
  grid: {
    gap: "0.875rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.sm]: {
        default: "repeat(2, minmax(0, 1fr))",
        [breakpoints.xl]: "repeat(3, minmax(0, 1fr))",
      },
    },
  },
  card: {
    padding: "1rem",
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  locked: {
    backgroundColor: `color-mix(in srgb, ${colors.card} 55%, transparent)`,
  },
  head: {
    gap: "0.75rem",
    alignItems: "flex-start",
    display: "flex",
  },
  medal: {
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2.5rem",
    width: "2.5rem",
  },
  medalLocked: {
    borderColor: colors.border,
    backgroundColor: colors.well,
    color: colors.mutedForeground,
    filter: "grayscale(1)",
  },
  text: {
    flex: "1",
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  nameLine: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
  },
  name: {
    fontSize: "0.9375rem",
    fontWeight: 650,
    lineHeight: 1.3,
  },
  muted: {
    color: colors.mutedForeground,
  },
  repeat: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.4,
  },
  rarity: {
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingInline: "0.4375rem",
    flexShrink: 0,
    fontSize: "0.6875rem",
    fontWeight: 650,
    lineHeight: "1.125rem",
  },
  progress: {
    gap: "0.375rem",
  },
  progressTrack: {
    borderRadius: radius.full,
    height: "0.375rem",
  },
  progressLine: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    justifyContent: "space-between",
  },
  rewards: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    marginTop: "auto",
    paddingTop: "0.25rem",
  },
  rewardsLabel: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  points: {
    fontSize: "0.8125rem",
  },
  effect: {
    fontSize: "0.875rem",
    fontWeight: 650,
  },
  // The border art spills 18% past the avatar, so the label keeps clear of it.
  border: {
    gap: "0.75rem",
    paddingInline: "0.375rem",
    alignItems: "center",
    color: colors.foreground,
    display: "inline-flex",
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
  skeletonCard: {
    borderRadius: radius.xxl,
    height: "9rem",
  },
})
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium" }).format(new Date(iso))

function CosmeticReward({
  cosmetic,
  profile,
}: {
  cosmetic: UserAchievement["rewards"]["cosmetics"][number]
  profile: UserProfile
}) {
  if (cosmetic.kind === "TITLE" && isUserTitle(cosmetic.key)) {
    return <TitleBadge size="sm" title={cosmetic.key} />
  }

  if (cosmetic.kind === "NAME_EFFECT" && isNameEffect(cosmetic.key)) {
    return <UserName effect={cosmetic.key} name={profile.displayUsername} sx={styles.effect} />
  }

  if (cosmetic.kind === "AVATAR_BORDER" && isAvatarBorder(cosmetic.key)) {
    return (
      <span sx={styles.border}>
        <ItemPreview itemKey={cosmetic.key} kind="AVATAR_BORDER" size="1.75rem" viewer={profile} />
        {AVATAR_BORDER_LABELS[cosmetic.key]()}
      </span>
    )
  }

  return null
}

function AchievementCard({
  achievement,
  profile,
}: {
  achievement: UserAchievement
  profile: UserProfile
}) {
  const { key, rarity, earned, progress, rewards, repeatable } = achievement
  const { icon: Icon } = CATEGORIES[achievement.category]

  return (
    <Card sx={[styles.card, earned === null && styles.locked]}>
      <div sx={styles.head}>
        <span
          aria-hidden
          sx={[styles.medal, earned === null ? styles.medalLocked : RARITY_STYLES[rarity]]}
        >
          {earned === null ? <Lock size={18} /> : <Icon size={18} />}
        </span>
        <div sx={styles.text}>
          <span sx={styles.nameLine}>
            <span sx={[styles.name, earned === null && styles.muted]}>
              {ACHIEVEMENT_LABELS[key].name()}
            </span>
            {repeatable && earned !== null && earned.count > 1 ? (
              <span sx={styles.repeat}>
                {m.achievements_times({ count: earned.count.toLocaleString(getLocale()) })}
              </span>
            ) : null}
          </span>
          <span sx={styles.description}>
            {earned === null
              ? describeAchievement(key)
              : m.achievements_earned_on({
                  date: formatDate(repeatable ? earned.lastEarnedAt : earned.firstEarnedAt),
                })}
          </span>
        </div>
        <span sx={[styles.rarity, RARITY_STYLES[rarity]]}>{RARITY_LABELS[rarity]()}</span>
      </div>
      {earned === null ? null : <span sx={styles.description}>{describeAchievement(key)}</span>}
      {earned !== null || progress === null ? null : (
        <Meter
          aria-label={describeAchievement(key)}
          max={progress.threshold}
          sx={styles.progress}
          value={Math.min(progress.value, progress.threshold)}
        >
          <MeterTrack sx={styles.progressTrack}>
            <MeterIndicator />
          </MeterTrack>
          <span sx={styles.progressLine}>
            <span>{m.achievements_progress_label()}</span>
            <span>
              {m.profile_unlock_progress({
                current: Math.min(progress.value, progress.threshold).toLocaleString(getLocale()),
                threshold: progress.threshold.toLocaleString(getLocale()),
              })}
            </span>
          </span>
        </Meter>
      )}
      {rewards.points === 0 && rewards.cosmetics.length === 0 ? null : (
        <div sx={styles.rewards}>
          <span sx={styles.rewardsLabel}>{m.achievements_rewards()}</span>
          {rewards.points === 0 ? null : (
            <PointsAmount points={rewards.points} size={13} sx={styles.points} />
          )}
          {rewards.cosmetics.map((cosmetic) => (
            <CosmeticReward key={cosmetic.key} cosmetic={cosmetic} profile={profile} />
          ))}
        </div>
      )}
    </Card>
  )
}

export function AchievementsTab({ profile }: { profile: UserProfile }) {
  const { data: achievements } = useSuspenseQuery(userAchievementsQueryOptions(profile.id))
  const earned = achievements.filter((achievement) => achievement.earned !== null).length

  return (
    <div sx={styles.root}>
      <p sx={styles.summary}>
        {m.achievements_summary({
          earned: earned.toLocaleString(getLocale()),
          total: achievements.length.toLocaleString(getLocale()),
        })}
      </p>
      {ACHIEVEMENT_CATEGORIES.map((category) => {
        const items = achievements
          .filter((achievement) => achievement.category === category)
          // Earned first, keeping the catalog's order within each group.
          .sort((a, b) => Number(b.earned !== null) - Number(a.earned !== null))
        const { icon: Icon, label } = CATEGORIES[category]

        return items.length === 0 ? null : (
          <section key={category} sx={styles.section}>
            <div sx={styles.sectionHead}>
              <Icon size={18} {...stylex.props(styles.sectionIcon)} />
              <h3 sx={styles.sectionTitle}>{label()}</h3>
              <span sx={styles.sectionCount}>
                {items.filter((item) => item.earned !== null).length}/{items.length}
              </span>
            </div>
            <div sx={styles.grid}>
              {items.map((achievement) => (
                <AchievementCard
                  key={achievement.key}
                  achievement={achievement}
                  profile={profile}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function AchievementsTabSkeleton() {
  return (
    <div aria-hidden sx={styles.grid}>
      {range(0, 6).map((index) => (
        <Skeleton key={index} sx={styles.skeletonCard} />
      ))}
    </div>
  )
}
