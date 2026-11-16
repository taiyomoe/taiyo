import * as stylex from "@stylexjs/stylex"
import {
  CancelCircle,
  CheckCircle,
  ExternalLink,
  Flag,
  Trash,
  User,
} from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { ReportedComment } from "@/features/comment-reports/api/comment-reports"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { CommentTargetLink } from "@/features/comment-reports/components/comment-report-target"
import { CommentTargetLabel } from "@/features/comment-reports/components/comment-target-label"
import { ReportReasons } from "@/features/comment-reports/components/report-reasons"
import { getExcerpt, REMOVAL_LABELS } from "@/features/comment-reports/lib/reported-comment"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

export const reportedCommentStyles = stylex.create({
  author: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  deletedAccount: {
    color: colors.mutedForeground,
    fontWeight: 400,
  },
  ghost: {
    borderRadius: "999px",
    alignItems: "center",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
  },
})

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
    whiteSpace: "pre-line",
  },
  empty: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  name: {
    minWidth: 0,
  },
  removal: {
    flexShrink: 0,
  },
})

export type CommentReportAction = "reports" | "dismiss" | "resolve" | "delete"

export function CommentReportRow({
  entry,
  open,
  canDelete,
  pending,
  selection,
  onAction,
}: {
  entry: ReportedComment
  /** The reports listed are still open. */
  open: boolean
  canDelete: boolean
  pending: boolean
  selection: Selection | undefined
  onAction: (action: CommentReportAction) => void
}) {
  const { comment } = entry
  const author = comment.originalAuthor
  const text = getExcerpt(entry)
  const name = author?.displayUsername ?? m.comments_deleted_account()
  const [latest] = entry.reports
  const run = (action: CommentReportAction) => () => {
    onAction(action)
  }
  const actions: RowAction[] = [
    { key: "reports", label: m.comment_reports_view(), icon: Flag, onClick: run("reports") },
    {
      key: "view",
      label: m.comments_view(),
      icon: ExternalLink,
      render: <CommentTargetLink commentId={comment.id} target={entry.target} />,
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
    ...(open && comment.removal !== null
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
    ...(canDelete && comment.removal === null
      ? [
          {
            key: "delete",
            label: m.comment_reports_delete(),
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
          disabled={!open && comment.removal !== null}
          id={comment.id}
          label={text === "" ? m.comments_image_only() : text.slice(0, 60)}
          selection={selection}
        />
      )}
      <CatalogCell column="comment">
        <TitleCell
          detail={
            <button
              onClick={run("reports")}
              sx={[styles.excerpt, text === "" && styles.empty]}
              title={text}
              type="button"
            >
              {text === "" ? m.comments_image_only() : text}
            </button>
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <CommentTargetLabel entry={entry} />
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
          thumb={
            author === null ? (
              <span sx={[mediaCellStyles.avatar, reportedCommentStyles.ghost]}>
                <User size={16} />
              </span>
            ) : (
              <PersonAvatar person={author} sx={mediaCellStyles.avatar} />
            )
          }
          title={
            <span sx={reportedCommentStyles.author}>
              {author === null ? (
                <span
                  sx={[mediaCellStyles.title, reportedCommentStyles.deletedAccount, styles.name]}
                >
                  {name}
                </span>
              ) : (
                <UserLink sx={[mediaCellStyles.title, styles.name]} user={author} />
              )}
              {comment.removal === null ||
              (author === null && comment.removal === "ACCOUNT_DELETED") ? null : (
                <span sx={styles.removal}>
                  <Pill size="sm" variant="secondary">
                    {REMOVAL_LABELS[comment.removal]()}
                  </Pill>
                </span>
              )}
            </span>
          }
        />
      </CatalogCell>
      <CatalogCell column="target">
        <CommentTargetLabel entry={entry} />
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
        <RowActions actions={actions} label={m.catalog_actions({ name })} />
      </CatalogCell>
    </TableRow>
  )
}
