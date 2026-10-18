import * as stylex from "@stylexjs/stylex"
import { ArrowRight } from "@taiyomoe/ui/components/icons"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { ActorAvatar, TargetThumb } from "@/features/activity-log/components/entity-avatar"
import { getCategory, getTargetLabel } from "@/features/activity-log/lib/activity-log"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  summary: {
    gap: "0.875rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  summaryPart: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 1,
    minWidth: 0,
  },
  summaryText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "min(24rem, 100%)",
    minWidth: 0,
  },
  summaryName: {
    overflow: "hidden",
    fontSize: "0.9375rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  summaryAction: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  summaryArrow: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
})

export function EntrySummary({ entry }: { entry: AuditLogEntry }) {
  const name =
    entry.actor.id === "anonymous"
      ? m.activity_anonymous()
      : (entry.actor.user?.displayUsername ?? entry.actor.displayName ?? entry.actor.id)

  return (
    <div sx={styles.summary}>
      <div sx={styles.summaryPart}>
        <ActorAvatar actor={entry.actor} size="2.5rem" />
        <div sx={styles.summaryText}>
          <span sx={styles.summaryName}>{name}</span>
          <span sx={styles.summaryAction}>{entry.action}</span>
        </div>
      </div>
      {entry.target === null ? null : (
        <>
          <ArrowRight {...stylex.props(styles.summaryArrow)} size={18} />
          <div sx={styles.summaryPart}>
            <TargetThumb
              category={getCategory(entry.action)}
              preview={entry.preview}
              size="2.5rem"
              targetType={entry.target.type}
            />
            <div sx={styles.summaryText}>
              <span sx={styles.summaryName}>{getTargetLabel(entry)}</span>
              <span sx={styles.summaryAction}>{entry.target.type}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
