import * as stylex from "@stylexjs/stylex"
import { CancelCircle, CheckCircle, ExternalLink, Flag, Trash } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { ReportedReview } from "@/features/review-reports/api/review-reports"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { Folded, mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { reportedCommentStyles } from "@/features/comment-reports/components/comment-report-row"
import { ReportReasons } from "@/features/comment-reports/components/report-reasons"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  excerpt: {
    font: "inherit",
    margin: 0,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    backgroundColor: "transparent",
    color: { default: colors.foreground, ":hover": colors.mutedForeground },
    cursor: "pointer",
    display: "-webkit-box",
    fontSize: "0.875rem",
    lineHeight: 1.4,
    overflowWrap: "anywhere",
    textAlign: "start",
  },
  media: {
    overflow: "hidden",
    textDecoration: "none",
    color: { default: colors.foreground, ":hover": colors.mutedForeground },
    display: "block",
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  name: {
    minWidth: 0,
  },
})

export type ReviewReportAction = "reports" | "dismiss" | "resolve" | "delete"

const getReviewExcerpt = (entry: ReportedReview) => entry.review.body.replaceAll(/\s+/g, " ").trim()

export function ReviewMediaLink({ entry }: { entry: ReportedReview }) {
  return (
    <Link
      params={{ mediaId: entry.media.id }}
      search={{ tab: "reviews" }}
      title={entry.media.title ?? m.media_untitled()}
      to="/media/$mediaId"
      {...stylex.props(styles.media)}
    >
      {entry.media.title ?? m.media_untitled()}
    </Link>
  )
}

export function ReviewRemovalPill({ entry }: { entry: ReportedReview }) {
  if (entry.review.deletedAt === null) {
    return null
  }

  return (
    <Pill size="sm" variant="secondary">
      {entry.review.deletedByAuthor
        ? m.comment_reports_removed_author()
        : m.comment_reports_removed_moderator()}
    </Pill>
  )
}

export function ReviewReportRow({
  entry,
  open,
  canDelete,
  pending,
  selection,
  onAction,
}: {
  entry: ReportedReview
  /** The reports listed are still open. */
  open: boolean
  canDelete: boolean
  pending: boolean
  selection: Selection | undefined
  onAction: (action: ReviewReportAction) => void
}) {
  const { review } = entry
  const deleted = review.deletedAt !== null
  const text = getReviewExcerpt(entry)
  const [latest] = entry.reports
  const run = (action: ReviewReportAction) => () => {
    onAction(action)
  }
  const actions: RowAction[] = [
    { key: "reports", label: m.comment_reports_view(), icon: Flag, onClick: run("reports") },
    {
      key: "view",
      label: m.review_reports_view_media(),
      icon: ExternalLink,
      render: (
        <Link
          params={{ mediaId: entry.media.id }}
          search={{ tab: "reviews" }}
          to="/media/$mediaId"
        />
      ),
    },
    ...(open
      ? [
          {
            key: "dismiss",
            label: m.comment_reports_dismiss(),
            icon: CancelCircle,
            disabled: pending,
            onClick: run("dismiss"),
          },
        ]
      : []),
    ...(open && deleted
      ? [
          {
            key: "resolve",
            label: m.comment_reports_resolve(),
            icon: CheckCircle,
            disabled: pending,
            onClick: run("resolve"),
          },
        ]
      : []),
    ...(canDelete && !deleted
      ? [
          {
            key: "delete",
            label: m.review_reports_delete(),
            icon: Trash,
            destructive: true,
            disabled: pending,
            onClick: run("delete"),
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell
          disabled={!open}
          id={review.id}
          label={text.slice(0, 60)}
          selection={selection}
        />
      )}
      <CatalogCell column="review">
        <TitleCell
          detail={
            <button
              dir="auto"
              onClick={run("reports")}
              sx={styles.excerpt}
              title={text}
              type="button"
            >
              {text}
            </button>
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <ReviewMediaLink entry={entry} />
                </Folded>
                <ReportReasons entry={entry} folded />
                {latest === undefined ? null : (
                  <span {...stylex.props(catalogStyles.muted)}>
                    <TimeAgo date={latest.createdAt} length="long" />
                  </span>
                )}
              </>
            ),
          }}
          thumb={<PersonAvatar person={review.author} sx={mediaCellStyles.avatar} />}
          title={
            <span sx={reportedCommentStyles.author}>
              <UserLink sx={[mediaCellStyles.title, styles.name]} user={review.author} />
              <ReviewRemovalPill entry={entry} />
            </span>
          }
        />
      </CatalogCell>
      <CatalogCell column="media">
        <ReviewMediaLink entry={entry} />
      </CatalogCell>
      <CatalogCell column="reports">
        <div {...stylex.props(catalogStyles.inline)}>
          <ReportReasons entry={entry} />
        </div>
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        {latest === undefined ? null : <TimeAgo date={latest.createdAt} length="long" />}
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions
          actions={actions}
          label={m.catalog_actions({ name: review.author.displayUsername })}
        />
      </CatalogCell>
    </TableRow>
  )
}
