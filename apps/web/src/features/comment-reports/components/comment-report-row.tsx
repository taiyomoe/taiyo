import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReportedComment } from "@/features/comment-reports/api/comment-reports"
import { ListRow } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { renderWithName } from "@/components/user-name/with-name"
import { CommentReportTarget } from "@/features/comment-reports/components/comment-report-target"
import { CommentContent } from "@/features/comments/components/comment-content"
import { COMMENT_REPORT_REASON_LABELS } from "@/features/comments/lib/report-reasons"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

const REMOVAL_LABELS = {
  AUTHOR: m.comment_reports_removed_author,
  PAGE_OWNER: m.comment_reports_removed_owner,
  MODERATOR: m.comment_reports_removed_moderator,
  ACCOUNT_DELETED: m.comment_reports_removed_account,
  HIDDEN: m.comment_reports_removed_hidden,
} satisfies Record<NonNullable<ReportedComment["comment"]["removal"]>, () => string>
const styles = stylex.create({
  body: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  target: {
    overflow: "hidden",
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 72%, transparent)`,
    },
    fontSize: "0.9375rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  quote: {
    borderRadius: radius.lg,
    gap: "0.5rem",
    paddingBlock: "0.75rem",
    paddingInline: "0.875rem",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    flexDirection: "column",
  },
  author: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  avatar: {
    height: "1.5rem",
    width: "1.5rem",
  },
  reports: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  report: {
    gap: "0.5rem",
    alignItems: "baseline",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  reason: {
    color: colors.foreground,
    fontWeight: 600,
  },
  details: {
    overflowWrap: "anywhere",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "flex-start",
    display: "flex",
    flexShrink: 0,
    flexWrap: "wrap",
  },
})

export function CommentReportRow({
  entry,
  pending,
  onClose,
  onDelete,
}: {
  entry: ReportedComment
  pending: boolean
  onClose: ((status: "RESOLVED" | "DISMISSED") => void) | null
  onDelete: (() => void) | null
}) {
  const { comment } = entry

  return (
    <ListRow>
      <div sx={styles.body}>
        <CommentReportTarget
          commentId={comment.id}
          linkProps={stylex.props(styles.target)}
          target={entry.target}
        />
        <div sx={styles.quote}>
          <span sx={styles.author}>
            {comment.author === null ? null : (
              <>
                <PersonAvatar person={comment.author} sx={styles.avatar} />
                <UserLink user={comment.author} />
              </>
            )}
            <TimeAgo date={comment.createdAt} />
            {comment.removal === null ? null : (
              <Badge variant="secondary">{REMOVAL_LABELS[comment.removal]()}</Badge>
            )}
            {entry.reportCount > 1 ? (
              <Badge variant="warning">
                {m.comment_reports_count({ count: entry.reportCount })}
              </Badge>
            ) : null}
          </span>
          <CommentContent
            content={comment.originalContent}
            images={comment.originalImages}
            interactive={false}
          />
        </div>
        <ul sx={styles.reports}>
          {entry.reports.map((report) => (
            <li key={report.id} sx={styles.report}>
              <span sx={styles.reason}>{COMMENT_REPORT_REASON_LABELS[report.reason]()}</span>
              {report.details === null ? null : <span sx={styles.details}>“{report.details}”</span>}
              <span>
                {renderWithName(m.comment_reports_reported_by, report.reporter, { link: true })} ·{" "}
                <TimeAgo date={report.createdAt} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {onClose === null ? null : (
        <div sx={styles.actions}>
          <Button
            disabled={pending}
            onClick={() => {
              onClose("DISMISSED")
            }}
            size="sm"
            variant="ghost"
          >
            {m.comment_reports_dismiss()}
          </Button>
          {onDelete === null ? (
            <Button
              disabled={pending}
              onClick={() => {
                onClose("RESOLVED")
              }}
              size="sm"
            >
              {m.comment_reports_resolve()}
            </Button>
          ) : (
            <Button disabled={pending} onClick={onDelete} size="sm" variant="destructive">
              {m.comment_reports_delete()}
            </Button>
          )}
        </div>
      )}
    </ListRow>
  )
}
