import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { RankedEntry } from "@/features/rankings/lib/ranking-entries"
import { MEDIA_STATUS_LABELS } from "@/features/media/lib/media-labels"
import { TitleBadge } from "@/features/users/components/profile/title-badge"

type Status = Extract<NonNullable<RankedEntry["tag"]>, { kind: "status" }>["status"]

const styles = stylex.create({
  chip: {
    borderRadius: radius.full,
    gap: "0.375rem",
    paddingInline: "0.625rem",
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
    whiteSpace: "nowrap",
    height: "1.5rem",
  },
  plain: {
    backgroundColor: colors.chip,
    boxShadow: `${shadows.chip}, inset 0 0 0 1px ${colors.border}`,
    color: colors.foreground,
  },
  RELEASING: {
    backgroundColor: `color-mix(in oklch, ${colors.success} 16%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colors.success} 32%, transparent)`,
    color: colors.successForeground,
  },
  FINISHED: {
    backgroundColor: `color-mix(in oklch, ${colors.info} 16%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colors.info} 32%, transparent)`,
    color: colors.infoForeground,
  },
  HIATUS: {
    backgroundColor: `color-mix(in oklch, ${colors.warning} 16%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colors.warning} 32%, transparent)`,
    color: colors.warningForeground,
  },
  CANCELLED: {
    backgroundColor: `color-mix(in oklch, ${colors.destructive} 16%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colors.destructive} 32%, transparent)`,
    color: colors.destructiveForeground,
  },
  NOT_YET_RELEASED: {
    backgroundColor: `color-mix(in oklch, ${colors.foreground} 16%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colors.foreground} 32%, transparent)`,
    color: colors.mutedForeground,
  },
  title: {
    fontWeight: 500,
    height: "1.5rem",
  },
})

export function RankingChip({ label, sx }: { label: string; sx?: Sx }) {
  return <span sx={[styles.chip, styles.plain, sx]}>{label}</span>
}

export function RankingTag({ tag }: { tag: RankedEntry["tag"] }) {
  if (tag === null) {
    return null
  }

  if (tag.kind === "title") {
    return <TitleBadge sx={styles.title} title={tag.title} />
  }

  const status: Status = tag.status

  return <span sx={[styles.chip, styles[status]]}>{MEDIA_STATUS_LABELS[status]()}</span>
}
