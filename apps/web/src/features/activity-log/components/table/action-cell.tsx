import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LogGroup } from "@/features/activity-log/lib/activity-log"
import { getCategoryTone } from "@/features/activity-log/components/entity-avatar"
import { tableStyles } from "@/features/activity-log/components/table/table-styles"
import { getCategory } from "@/features/activity-log/lib/activity-log"
import { formatCount } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const OUTCOME_BADGES = {
  success: "success",
  failure: "warning",
  denied: "error",
} as const
const OUTCOME_LABELS = {
  success: m.activity_outcome_success,
  failure: m.activity_outcome_failure,
  denied: m.activity_outcome_denied,
}
const styles = stylex.create({
  action: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  actionMeta: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  actionName: {
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  category: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "inline-flex",
    fontSize: "0.75rem",
  },
  categoryDot: (color: string) => ({
    borderRadius: radius.full,
    backgroundColor: color,
    flexShrink: 0,
    height: "0.375rem",
    width: "0.375rem",
  }),
  actionLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  count: {
    borderRadius: radius.full,
    paddingBlock: "0.0625rem",
    paddingInline: "0.4375rem",
    backgroundColor: `color-mix(in srgb, ${colors.primary} 14%, transparent)`,
    color: colors.primary,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  },
})

export function ActionCell({ group: { entry, count } }: { group: LogGroup }) {
  return (
    <div sx={styles.action}>
      <span sx={styles.actionLine}>
        <span sx={[styles.actionName, tableStyles.ellipsis]}>{entry.action}</span>
        {count > 1 ? (
          <span
            aria-label={m.activity_group_count({ count: formatCount(count) })}
            sx={styles.count}
          >
            ×{formatCount(count)}
          </span>
        ) : null}
      </span>
      <span sx={styles.actionMeta}>
        <Badge size="sm" variant={OUTCOME_BADGES[entry.outcome]}>
          {OUTCOME_LABELS[entry.outcome]()}
        </Badge>
        <span sx={styles.category}>
          <span sx={styles.categoryDot(getCategoryTone(getCategory(entry.action)))} />
          {getCategory(entry.action)}
        </span>
      </span>
    </div>
  )
}
