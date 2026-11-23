import type { CommentReportStatus } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { CancelCircle, CheckCircle, ExternalLink, Trash } from "@taiyomoe/ui/components/icons"
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
import { Link } from "@tanstack/react-router"
import type { ReportedReview } from "@/features/review-reports/api/review-reports"
import type { ReviewReportAction } from "@/features/review-reports/components/review-report-row"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { renderWithName } from "@/components/user-name/with-name"
import { REPORT_REASON_OPTIONS } from "@/features/comment-reports/lib/report-options"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import {
  ReviewMediaLink,
  ReviewRemovalPill,
} from "@/features/review-reports/components/review-report-row"
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
  text: {
    margin: 0,
    fontSize: "0.875rem",
    lineHeight: 1.55,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
    maxHeight: "40vh",
    overflowY: "auto",
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
})

/** The whole reported review and its latest reports. */
export function ReviewReportDialog({
  entry,
  status,
  canDelete,
  onAction,
  onClose,
}: {
  entry: ReportedReview
  status: CommentReportStatus
  canDelete: boolean
  onAction: (action: Exclude<ReviewReportAction, "reports">) => void
  onClose: () => void
}) {
  const { review } = entry
  const open = status === "OPEN"
  const deleted = review.deletedAt !== null

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
          <DialogTitle>{m.review_reports_dialog_title()}</DialogTitle>
          <DialogDescription render={<div />}>
            <ReviewMediaLink entry={entry} />
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={styles.body}>
            <div sx={styles.quote}>
              <span sx={styles.meta}>
                <PersonAvatar person={review.author} sx={styles.avatar} />
                <UserLink sx={styles.name} user={review.author} />
                {review.score === null ? null : (
                  <Pill size="sm">
                    {m.rating_score_of({ score: review.score, max: config.ratings.maxScore })}
                  </Pill>
                )}
                {review.containsSpoilers ? (
                  <Pill size="sm" variant="warning">
                    {m.reviews_contains_spoilers()}
                  </Pill>
                ) : null}
                <TimeAgo date={review.createdAt} length="long" />
                <ReviewRemovalPill entry={entry} />
              </span>
              <p sx={styles.text}>{review.body}</p>
            </div>
            <h3 sx={styles.heading}>
              {m.comment_reports_list_heading({ count: entry.reportCount })}
            </h3>
            <ul sx={styles.reports}>
              {entry.reports.map((report) => (
                <li key={report.id} sx={styles.report}>
                  <span sx={styles.reportMeta}>
                    <Pill icon={REPORT_REASON_OPTIONS.icon(report.reason)}>
                      {REPORT_REASON_OPTIONS.label(report.reason)}
                    </Pill>
                    {renderWithName(m.comment_reports_reported_by, report.reporter, { link: true })}
                    <TimeAgo date={report.createdAt} length="long" />
                  </span>
                  {report.details === null ? null : <p sx={styles.details}>{report.details}</p>}
                </li>
              ))}
            </ul>
          </div>
        </DialogPanel>
        <DialogFooter>
          <Button
            render={
              <Link
                params={{ mediaId: entry.media.id }}
                search={{ tab: "reviews" }}
                to="/media/$mediaId"
              />
            }
            variant="outline"
          >
            {m.review_reports_view_media()}
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
          {open && deleted ? (
            <Button
              onClick={() => {
                onAction("resolve")
              }}
            >
              <CheckCircle />
              {m.comment_reports_resolve()}
            </Button>
          ) : null}
          {canDelete && !deleted ? (
            <Button
              onClick={() => {
                onAction("delete")
              }}
              variant="destructive"
            >
              <Trash />
              {m.review_reports_delete()}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
