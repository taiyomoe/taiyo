import * as stylex from "@stylexjs/stylex"
import { getLevelProgress } from "@taiyomoe/db/levels"
import { Sparkles, Tag } from "@taiyomoe/ui/components/icons"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserProfile } from "@/features/users/api/profile"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { READER_RANK_LABELS } from "@/features/users/lib/level-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  layout: {
    gap: { default: "1rem", [breakpoints.sm]: "1.5rem" },
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    position: "relative",
  },
  medal: {
    borderRadius: radius.xl,
    alignItems: "center",
    backgroundImage: `linear-gradient(145deg, color-mix(in srgb, ${colors.primary} 70%, #ffb347), ${colors.primary})`,
    boxShadow: `0 12px 28px -12px color-mix(in srgb, ${colors.primary} 70%, transparent), inset 0 1px 0 rgb(255 255 255 / 25%)`,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: { default: "4.25rem", [breakpoints.sm]: "5rem" },
    width: { default: "4.25rem", [breakpoints.sm]: "5rem" },
  },
  medalLabel: {
    fontSize: "0.625rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    opacity: 0.85,
    textTransform: "uppercase",
  },
  medalLevel: {
    fontFamily: font.mono,
    fontSize: { default: "1.625rem", [breakpoints.sm]: "1.875rem" },
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    lineHeight: 1.05,
  },
  body: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  head: {
    alignItems: "center",
    columnGap: "0.75rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.375rem",
  },
  rank: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.25rem", [breakpoints.sm]: "1.5rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    lineHeight: 1.15,
  },
  pills: {
    gap: "0.375rem",
    display: "flex",
    flexWrap: "wrap",
  },
  pill: {
    borderColor: `color-mix(in srgb, ${colors.primary} 40%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.3125rem",
    paddingBlock: "0.125rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.primary} 10%, transparent)`,
    color: `color-mix(in srgb, ${colors.primary} 70%, ${colors.foreground})`,
    display: "inline-flex",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  progressHead: {
    gap: "0.75rem",
    alignItems: "baseline",
    display: "flex",
    fontSize: "0.875rem",
    justifyContent: "space-between",
  },
  progressText: {
    color: colors.mutedForeground,
  },
  strong: {
    color: colors.foreground,
    fontWeight: 600,
  },
  percent: {
    color: `color-mix(in srgb, ${colors.primary} 75%, ${colors.foreground})`,
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  },
  track: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.well,
    boxShadow: "inset 0 1px 2px rgb(0 0 0 / 35%)",
    height: "0.5rem",
  },
  fill: {
    borderRadius: radius.full,
    backgroundImage: `linear-gradient(90deg, ${colors.primary}, color-mix(in srgb, ${colors.primary} 55%, #ffb347))`,
    height: "100%",
    minWidth: "0.5rem",
  },
  next: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
})

export function LevelCard({ profile }: { profile: UserProfile }) {
  const locale = getLocale()
  const number = new Intl.NumberFormat(locale)
  const progress = getLevelProgress(profile.xp)
  const ratio = progress.levelXp / progress.levelCost
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })

  return (
    <section aria-label={m.profile_level_title()} sx={profileStyles.card}>
      <div sx={styles.layout}>
        <div sx={styles.medal}>
          <span sx={styles.medalLabel}>{m.profile_level_label()}</span>
          <span sx={styles.medalLevel}>{progress.level}</span>
        </div>
        <div sx={styles.body}>
          <div sx={styles.head}>
            <h2 sx={styles.rank}>{READER_RANK_LABELS[progress.rank]()}</h2>
            <div sx={styles.pills}>
              <span sx={styles.pill}>{m.profile_level_xp({ xp: number.format(profile.xp) })}</span>
              <span sx={styles.pill} title={m.profile_detail_points()}>
                <Sparkles size={12} />
                {number.format(profile.points)}
              </span>
            </div>
          </div>
          <div sx={styles.progressHead}>
            <span sx={styles.progressText}>
              <span sx={styles.strong}>{number.format(progress.levelXp)}</span>
              {" / "}
              {m.profile_level_to_next({
                xp: number.format(progress.levelCost),
                level: number.format(progress.level + 1),
              })}
            </span>
            <span sx={styles.percent}>{percent.format(ratio)}</span>
          </div>
          <div
            aria-label={m.profile_level_progress()}
            aria-valuemax={progress.levelCost}
            aria-valuemin={0}
            aria-valuenow={progress.levelXp}
            role="progressbar"
            sx={styles.track}
          >
            <div style={{ width: `${Math.max(ratio * 100, 0)}%` }} sx={styles.fill} />
          </div>
          {progress.nextRank === null ? null : (
            <span sx={styles.next}>
              <Tag size={14} />
              {m.profile_level_next_rank()}
              <span sx={styles.strong}>
                {m.profile_level_rank_at({
                  rank: READER_RANK_LABELS[progress.nextRank.key](),
                  level: number.format(progress.nextRank.level),
                })}
              </span>
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
