import type { CommentReportStatus } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { CancelCircle, CheckCircle, ExternalLink, Trash, User } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { CommentReport, ReportedComment } from "@/features/comment-reports/api/comment-reports"
import type { CommentReportAction } from "@/features/comment-reports/components/comment-report-row"
import { Pill } from "@/components/badges/pill"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { renderWithName } from "@/components/user-name/with-name"
import { commentReportListQueryOptions } from "@/features/comment-reports/api/comment-reports"
import { reportedCommentStyles } from "@/features/comment-reports/components/comment-report-row"
import { CommentTargetLink } from "@/features/comment-reports/components/comment-report-target"
import { CommentTargetLabel } from "@/features/comment-reports/components/comment-target-label"
import { REPORT_REASON_OPTIONS } from "@/features/comment-reports/lib/report-options"
import { REMOVAL_LABELS } from "@/features/comment-reports/lib/reported-comment"
import { CommentContent } from "@/features/comments/components/comment-content"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    maxWidth: "40rem",
  },
  body: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  quote: {
    borderRadius: radius.lg,
    gap: "0.625rem",
    paddingBlock: "0.75rem",
    paddingInline: "0.875rem",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  avatar: {
    flexShrink: 0,
    height: "1.5rem",
    width: "1.5rem",
  },
  name: {
    overflow: "hidden",
    color: colors.foreground,
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  heading: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  reports: {
    margin: 0,
    padding: 0,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    listStyle: "none",
    overflow: "hidden",
  },
  report: {
    gap: "0.375rem",
    paddingBlock: "0.75rem",
    paddingInline: "0.875rem",
    display: "flex",
    flexDirection: "column",
    borderTopColor: colors.border,
    borderTopStyle: { default: "solid", ":first-child": "none" },
    borderTopWidth: 1,
  },
  reportMeta: {
    alignItems: "center",
    color: colors.mutedForeground,
    columnGap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
    rowGap: "0.25rem",
  },
  details: {
    margin: 0,
    fontSize: "0.875rem",
    lineHeight: 1.45,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  more: {
    alignSelf: "center",
  },
})

function ReportItem({ report }: { report: CommentReport }) {
  return (
    <li sx={styles.report}>
      <span sx={styles.reportMeta}>
        <Pill icon={REPORT_REASON_OPTIONS.icon(report.reason)}>
          {REPORT_REASON_OPTIONS.label(report.reason)}
        </Pill>
        {renderWithName(m.comment_reports_reported_by, report.reporter, { link: true })}
        <TimeAgo date={report.createdAt} length="long" />
      </span>
      {report.details === null ? null : <p sx={styles.details}>{report.details}</p>}
    </li>
  )
}

/** The whole reported comment, with its images and every report on it. */
export function CommentReportDialog({
  entry,
  status,
  canDelete,
  onAction,
  onClose,
}: {
  entry: ReportedComment
  status: CommentReportStatus
  canDelete: boolean
  onAction: (action: Exclude<CommentReportAction, "reports">) => void
  onClose: () => void
}) {
  const { comment } = entry
  const author = comment.originalAuthor
  const open = status === "OPEN"
  const reports = useInfiniteQuery(commentReportListQueryOptions(comment.id, status))
  const listed = reports.data?.pages.flatMap((page) => page.data) ?? entry.reports
  const total = reports.data?.pages[0]?.meta.total ?? entry.reportCount

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
      open
    >
      <DialogPopup sx={styles.popup}>
        <DialogHeader>
          <DialogTitle>{m.comment_reports_dialog_title()}</DialogTitle>
          <DialogDescription render={<div />}>
            <CommentTargetLabel entry={entry} />
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={styles.body}>
            <div sx={styles.quote}>
              <span sx={styles.meta}>
                {author === null ? (
                  <>
                    <span sx={[styles.avatar, reportedCommentStyles.ghost]}>
                      <User size={14} />
                    </span>
                    <span sx={styles.name}>{m.comments_deleted_account()}</span>
                  </>
                ) : (
                  <>
                    <PersonAvatar person={author} sx={styles.avatar} />
                    <UserLink sx={styles.name} user={author} />
                  </>
                )}
                <TimeAgo date={comment.createdAt} length="long" />
                {comment.removal === null ||
                (author === null && comment.removal === "ACCOUNT_DELETED") ? null : (
                  <Pill size="sm" variant="secondary">
                    {REMOVAL_LABELS[comment.removal]()}
                  </Pill>
                )}
              </span>
              <CommentContent
                content={comment.originalContent}
                images={comment.originalImages}
                interactive={false}
              />
            </div>
            <h3 sx={styles.heading}>{m.comment_reports_list_heading({ count: total })}</h3>
            <ErrorAlert message={reports.isError ? getErrorMessage(reports.error) : null} />
            <ul aria-busy={reports.isFetching} sx={styles.reports}>
              {listed.map((report) => (
                <ReportItem key={report.id} report={report} />
              ))}
            </ul>
            {reports.hasNextPage ? (
              <Button
                loading={reports.isFetchingNextPage}
                onClick={() => {
                  void reports.fetchNextPage()
                }}
                sx={styles.more}
                variant="outline"
              >
                {m.comment_reports_more()}
              </Button>
            ) : null}
          </div>
        </DialogPanel>
        <DialogFooter>
          <Button
            render={<CommentTargetLink commentId={comment.id} target={entry.target} />}
            variant="outline"
          >
            {m.comments_view()}
            <ExternalLink />
          </Button>
          {open ? (
            <Button
              onClick={() => {
                onAction("dismiss")
              }}
              variant="outline"
            >
              <CancelCircle />
              {m.comment_reports_dismiss()}
            </Button>
          ) : null}
          {open && comment.removal !== null ? (
            <Button
              onClick={() => {
                onAction("resolve")
              }}
            >
              <CheckCircle />
              {m.comment_reports_resolve()}
            </Button>
          ) : null}
          {canDelete && comment.removal === null ? (
            <Button
              onClick={() => {
                onAction("delete")
              }}
              variant="destructive"
            >
              <Trash />
              {m.comment_reports_delete()}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
