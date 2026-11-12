import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@taiyomoe/ui/components/ui/tooltip"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Comment } from "@/features/comments/api/comments"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  header: {
    alignItems: "center",
    columnGap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.25rem",
    minWidth: 0,
  },
  author: {
    borderRadius: radius.sm,
    overflow: "hidden",
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontSize: "0.9375rem",
    fontWeight: 650,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textOverflow: "ellipsis",
    transitionDuration: "150ms",
    transitionProperty: "color",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  time: {
    fontSize: "0.8125rem",
  },
  edited: {
    color: colors.mutedForeground,
    cursor: "default",
    fontSize: "0.75rem",
  },
})

export function CommentHeader({ comment }: { comment: Comment }) {
  const { author } = comment

  return (
    <div sx={styles.header}>
      {author === null ? null : (
        <>
          <UserLink sx={styles.author} user={author} />
          {author.role === "ADMIN" || author.role === "MODERATOR" ? (
            <Badge size="sm" variant="info">
              {author.role === "ADMIN" ? m.comments_role_admin() : m.comments_role_moderator()}
            </Badge>
          ) : null}
          <TitleBadge size="sm" title={author.title} />
        </>
      )}
      <TimeAgo date={comment.createdAt} sx={styles.time} />
      {comment.editedAt === null ? null : (
        <Tooltip>
          <TooltipTrigger delay={200} render={<span sx={styles.edited} />}>
            {m.comments_edited()}
          </TooltipTrigger>
          <TooltipPopup>
            {m.comments_edited_at({ date: new Date(comment.editedAt).toLocaleString(getLocale()) })}
          </TooltipPopup>
        </Tooltip>
      )}
    </div>
  )
}
