import * as stylex from "@stylexjs/stylex"
import { getCommentText } from "@taiyomoe/schemas/comment-content"
import { ExternalLink, Image, Reply, ThumbsUp, Trash, User } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { ManagedComment } from "@/features/comments/api/managed-comments"
import { OptionValueIcon } from "@/components/fields/option-select"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import {
  COMMENT_TARGET_LABELS,
  CommentTargetLink,
} from "@/features/comment-reports/components/comment-report-target"
import { COMMENT_TARGET_OPTIONS } from "@/features/comments/lib/comment-target-options"
import { formatNumber } from "@/features/dashboard/lib/format"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

const REMOVAL_LABELS = {
  AUTHOR: m.comment_reports_removed_author,
  PAGE_OWNER: m.comment_reports_removed_owner,
  MODERATOR: m.comment_reports_removed_moderator,
} satisfies Record<NonNullable<ManagedComment["deletion"]>, () => string>
const styles = stylex.create({
  author: {
    color: colors.mutedForeground,
    fontWeight: 400,
  },
  excerpt: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.foreground,
    display: "-webkit-box",
    fontSize: "0.875rem",
    lineHeight: 1.4,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  removal: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontStyle: "italic",
    lineHeight: 1.35,
    whiteSpace: "normal",
  },
  empty: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  ghost: {
    borderRadius: "999px",
    alignItems: "center",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
  },
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
  targetLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function ManagedCommentRow({
  comment,
  selection,
  canDelete,
  onAuthor,
  onDelete,
}: {
  comment: ManagedComment
  selection: Selection | undefined
  canDelete: boolean
  onAuthor: (() => void) | null
  onDelete: () => void
}) {
  const text = getCommentText(comment.content)
    .replaceAll(/\*\*|__|~~|\|\|/g, "")
    .replaceAll(/\s+/g, " ")
    .trim()
  const targetLabel = comment.target.label ?? m.media_untitled()
  const target = (
    <CommentTargetLink
      commentId={comment.id}
      target={comment.target}
      title={`${COMMENT_TARGET_LABELS[comment.target.type]()} · ${targetLabel}`}
      {...stylex.props(styles.target)}
    >
      <OptionValueIcon options={COMMENT_TARGET_OPTIONS} value={comment.target.type} />
      <span sx={styles.targetLabel}>{targetLabel}</span>
    </CommentTargetLink>
  )
  const date =
    comment.deletedAt === null ? (
      <TimeAgo date={comment.createdAt} length="long" />
    ) : (
      <div {...stylex.props(catalogStyles.stack)}>
        <TimeAgo date={comment.deletedAt} length="long" />
        {comment.deletion === null ? null : (
          <span sx={styles.removal}>{REMOVAL_LABELS[comment.deletion]()}</span>
        )}
      </div>
    )
  const stats = (
    <>
      <span
        {...stylex.props(catalogStyles.inline, catalogStyles.muted)}
        title={m.comments_upvotes()}
      >
        <ThumbsUp size={14} />
        {formatNumber(comment.upvoteCount)}
      </span>
      {comment.replyCount === 0 ? null : (
        <span
          {...stylex.props(catalogStyles.inline, catalogStyles.muted)}
          title={m.comments_replies()}
        >
          <Reply size={14} />
          {formatNumber(comment.replyCount)}
        </span>
      )}
      {comment.imageCount === 0 ? null : (
        <span
          {...stylex.props(catalogStyles.inline, catalogStyles.muted)}
          title={m.comments_images()}
        >
          <Image size={14} />
          {formatNumber(comment.imageCount)}
        </span>
      )}
    </>
  )
  const actions: RowAction[] = [
    {
      key: "view",
      label: m.comments_view(),
      icon: ExternalLink,
      render: <CommentTargetLink commentId={comment.id} target={comment.target} />,
    },
    ...(onAuthor === null
      ? []
      : [{ key: "author", label: m.comments_filter_author(), icon: User, onClick: onAuthor }]),
    ...(canDelete && comment.deletedAt === null
      ? [
          {
            key: "delete",
            label: m.catalog_delete(),
            icon: Trash,
            destructive: true,
            onClick: onDelete,
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell
          id={comment.id}
          label={text === "" ? m.comments_image_only() : text.slice(0, 60)}
          selection={selection}
        />
      )}
      <CatalogCell column="comment">
        <TitleCell
          detail={
            <span sx={[styles.excerpt, text === "" && styles.empty]} title={text}>
              {text === "" ? m.comments_image_only() : text}
            </span>
          }
          narrow={{
            from: "3xl",
            content: (
              <>
                {target}
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={comment.deletedAt ?? comment.createdAt} length="long" />
                </span>
                {comment.deletion === null ? null : (
                  <span sx={styles.removal}>{REMOVAL_LABELS[comment.deletion]()}</span>
                )}
                {stats}
              </>
            ),
          }}
          thumb={
            comment.author === null ? (
              <span sx={[mediaCellStyles.avatar, styles.ghost]}>
                <User size={16} />
              </span>
            ) : (
              <PersonAvatar person={comment.author} sx={mediaCellStyles.avatar} />
            )
          }
          title={
            comment.author === null ? (
              <span sx={[mediaCellStyles.title, styles.author]}>
                {m.comments_deleted_account()}
              </span>
            ) : (
              <UserLink sx={mediaCellStyles.title} user={comment.author} />
            )
          }
        />
      </CatalogCell>
      <CatalogCell column="target">{target}</CatalogCell>
      <CatalogCell column="stats">
        <div {...stylex.props(catalogStyles.inline)}>{stats}</div>
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        {date}
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions
          actions={actions}
          label={m.catalog_actions({
            name: comment.author?.displayUsername ?? m.comments_deleted_account(),
          })}
        />
      </CatalogCell>
    </TableRow>
  )
}
