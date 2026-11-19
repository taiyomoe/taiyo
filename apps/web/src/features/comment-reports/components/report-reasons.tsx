import * as stylex from "@stylexjs/stylex"
import { Flag } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReportedComment } from "@/features/comment-reports/api/comment-reports"
import { Pill } from "@/components/badges/pill"
import { REPORT_REASON_OPTIONS } from "@/features/comment-reports/lib/report-options"
import { getReasons } from "@/features/comment-reports/lib/reported-comment"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    gap: "0.375rem",
    alignItems: "flex-start",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
    minWidth: 0,
  },
  icon: {
    flexShrink: 0,
    height: "1lh",
  },
})

/**
 * The reasons a comment was reported for, and how many times when more than once. Folded
 * under a narrow row, the reasons read as one line of text that wraps instead of pills.
 */
export function ReportReasons({
  entry,
  folded = false,
}: {
  entry: ReportedComment
  folded?: boolean
}) {
  const reasons = getReasons(entry)

  return (
    <>
      {folded ? (
        <span sx={styles.list}>
          <Flag aria-hidden size={14} {...stylex.props(styles.icon)} />
          {reasons.map((reason) => REPORT_REASON_OPTIONS.label(reason)).join(", ")}
        </span>
      ) : (
        reasons.map((reason) => (
          <Pill icon={REPORT_REASON_OPTIONS.icon(reason)} key={reason}>
            {REPORT_REASON_OPTIONS.label(reason)}
          </Pill>
        ))
      )}
      {entry.reportCount > 1 ? (
        <Pill variant="warning">{m.comment_reports_count({ count: entry.reportCount })}</Pill>
      ) : null}
    </>
  )
}
