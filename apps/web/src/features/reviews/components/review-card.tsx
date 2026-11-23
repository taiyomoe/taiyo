import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Ellipsis, Star, ThumbsUp } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@taiyomoe/ui/components/ui/tooltip"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { Review, UserReview } from "@/features/reviews/api/reviews"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { useDeleteReview, useVoteReview } from "@/features/reviews/api/reviews"
import { ReportReviewDialog } from "@/features/reviews/components/report-review-dialog"
import { ReviewBody } from "@/features/reviews/components/review-body"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  card: {
    gap: { default: "0.75rem", [breakpoints.sm]: "0.875rem" },
    paddingBlock: "1rem",
    alignItems: "flex-start",
    display: "flex",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  avatar: {
    flexShrink: 0,
    height: { default: "2.25rem", [breakpoints.sm]: "2.5rem" },
    width: { default: "2.25rem", [breakpoints.sm]: "2.5rem" },
  },
  cover: {
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    flexShrink: 0,
    objectFit: "cover",
    height: "4.5rem",
    width: "3rem",
  },
  body: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  header: {
    alignItems: "center",
    columnGap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.25rem",
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontSize: "0.9375rem",
    fontWeight: 650,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  score: {
    borderRadius: radius.full,
    gap: "0.25rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.warning} 14%, transparent)`,
    color: colors.foreground,
    display: "inline-flex",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    lineHeight: "1.375rem",
  },
  star: {
    color: colors.warning,
  },
  meta: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  edited: {
    color: colors.mutedForeground,
    cursor: "default",
    fontSize: "0.75rem",
  },
  footer: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    marginInlineStart: "-0.5rem",
  },
  count: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    paddingInlineStart: "0.5rem",
  },
  voted: {
    color: colors.primary,
  },
})

function HelpfulButton({ review }: { review: Review }) {
  const vote = useVoteReview(review.id)
  const { viewer, helpfulCount } = review

  if (viewer === null || !viewer.canReport) {
    return helpfulCount === 0 ? (
      <span />
    ) : (
      <span sx={styles.count}>{m.reviews_helpful_count({ count: helpfulCount })}</span>
    )
  }

  return (
    <Button
      aria-pressed={viewer.voted}
      onClick={() => {
        vote.mutate(!viewer.voted)
      }}
      size="sm"
      sx={viewer.voted && styles.voted}
      variant="ghost"
    >
      <ThumbsUp />
      {m.reviews_helpful()}
      {helpfulCount === 0 ? null : <span>· {helpfulCount}</span>}
    </Button>
  )
}

function ReviewMenu({ review, onEdit }: { review: Review; onEdit: (() => void) | undefined }) {
  const remove = useDeleteReview()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [reporting, setReporting] = useState(false)
  const { viewer } = review

  if (viewer === null || (!viewer.canReport && !viewer.canDelete)) {
    return null
  }

  return (
    <>
      <Menu>
        <MenuTrigger
          render={<Button aria-label={m.reviews_more()} size="icon-xs" variant="ghost" />}
        >
          <Ellipsis />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuGroup>
            {viewer.canEdit && onEdit !== undefined ? (
              <MenuItem onClick={onEdit}>{m.reviews_edit()}</MenuItem>
            ) : null}
            {viewer.canReport ? (
              <MenuItem
                onClick={() => {
                  setReporting(true)
                }}
              >
                {m.reviews_report()}
              </MenuItem>
            ) : null}
          </MenuGroup>
          {viewer.canDelete ? (
            <>
              <MenuSeparator />
              <MenuGroup>
                <MenuItem
                  onClick={() => {
                    setConfirmation({
                      title: m.reviews_delete_title(),
                      description: viewer.canEdit
                        ? m.reviews_delete_description()
                        : m.reviews_remove_description(),
                      confirmLabel: m.reviews_delete(),
                      destructive: true,
                      run: () => remove.mutateAsync(review),
                    })
                  }}
                  variant="destructive"
                >
                  {m.reviews_delete()}
                </MenuItem>
              </MenuGroup>
            </>
          ) : null}
        </MenuPopup>
      </Menu>
      <ConfirmDialog
        confirmation={confirmation}
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          setConfirmation(null)
          remove.reset()
        }}
        pending={remove.isPending}
      />
      <ReportReviewDialog
        onClose={() => {
          setReporting(false)
        }}
        reviewId={reporting ? review.id : null}
      />
    </>
  )
}

/** One review, signed by its author, or titled by its media on the author's own profile. */
export function ReviewCard({
  review,
  onEdit,
  label,
}: {
  review: Review | UserReview
  onEdit?: () => void
  label?: string
}) {
  const media = "media" in review ? review.media : null

  return (
    <article aria-label={label} sx={styles.card}>
      {media === null ? (
        <Link params={{ username: review.author.username }} tabIndex={-1} to="/users/$username">
          <PersonAvatar person={review.author} sx={styles.avatar} />
        </Link>
      ) : (
        <Link params={{ mediaId: review.mediaId }} tabIndex={-1} to="/media/$mediaId">
          {media.coverUrl === null ? (
            <span sx={styles.cover} />
          ) : (
            <img alt="" loading="lazy" src={media.coverUrl} sx={styles.cover} />
          )}
        </Link>
      )}
      <div sx={styles.body}>
        <div sx={styles.header}>
          {media === null ? (
            <UserLink sx={styles.name} user={review.author} />
          ) : (
            <Link
              params={{ mediaId: review.mediaId }}
              to="/media/$mediaId"
              {...stylex.props(styles.name)}
            >
              {media.title ?? m.media_untitled()}
            </Link>
          )}
          {review.score === null ? null : (
            <span
              aria-label={m.rating_score_option({
                score: review.score,
                max: config.ratings.maxScore,
              })}
              role="img"
              sx={styles.score}
            >
              <Star aria-hidden size={12} {...stylex.props(styles.star)} />
              {m.rating_score_of({ score: review.score, max: config.ratings.maxScore })}
            </span>
          )}
          <TimeAgo date={review.createdAt} sx={styles.meta} />
          {review.editedAt === null ? null : (
            <Tooltip>
              <TooltipTrigger delay={200} render={<span sx={styles.edited} />}>
                {m.reviews_edited()}
              </TooltipTrigger>
              <TooltipPopup>
                {m.reviews_edited_at({
                  date: new Date(review.editedAt).toLocaleString(getLocale()),
                })}
              </TooltipPopup>
            </Tooltip>
          )}
        </div>
        <ReviewBody body={review.body} containsSpoilers={review.containsSpoilers} />
        <div sx={styles.footer}>
          <HelpfulButton review={review} />
          <ReviewMenu onEdit={onEdit} review={review} />
        </div>
      </div>
    </article>
  )
}
