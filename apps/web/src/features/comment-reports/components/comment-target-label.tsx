import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReportedComment } from "@/features/comment-reports/api/comment-reports"
import { OptionValueIcon } from "@/components/fields/option-select"
import {
  COMMENT_TARGET_LABELS,
  CommentTargetLink,
} from "@/features/comment-reports/components/comment-report-target"
import { COMMENT_TARGET_OPTIONS } from "@/features/comments/lib/comment-target-options"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  target: {
    gap: "0.375rem",
    overflow: "hidden",
    textDecoration: "none",
    alignItems: "center",
    color: { default: colors.foreground, ":hover": colors.mutedForeground },
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

/** Where a reported comment was posted, with the icon of its kind, linking to the comment there. */
export function CommentTargetLabel({ entry }: { entry: ReportedComment }) {
  const label = entry.target.label ?? m.media_untitled()

  return (
    <CommentTargetLink
      commentId={entry.comment.id}
      target={entry.target}
      title={`${COMMENT_TARGET_LABELS[entry.target.type]()} · ${label}`}
      {...stylex.props(styles.target)}
    >
      <OptionValueIcon options={COMMENT_TARGET_OPTIONS} value={entry.target.type} />
      <span sx={styles.label}>{label}</span>
    </CommentTargetLink>
  )
}
