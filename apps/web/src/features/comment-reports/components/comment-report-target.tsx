import type * as stylex from "@stylexjs/stylex"
import type { CommentTargetType } from "@taiyomoe/db/constants"
import type { ComponentProps, ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import type { ReportedComment } from "@/features/comment-reports/api/comment-reports"
import { m } from "@/paraglide/messages"

export const COMMENT_TARGET_LABELS = {
  MEDIA: m.comment_reports_target_media,
  CHAPTER: m.comment_reports_target_chapter,
  GROUP: m.comment_reports_target_group,
  USER: m.comment_reports_target_user,
} satisfies Record<CommentTargetType, () => string>

type CommentTarget = { type: CommentTargetType; id: string; username: string | null }

/** A link to a comment where it was posted, scrolled to and highlighted. */
export function CommentTargetLink({
  target,
  commentId,
  children,
  ...props
}: Omit<ComponentProps<"a">, "href" | "target"> & {
  target: CommentTarget
  commentId: string
  children?: ReactNode
}) {
  if (target.type === "MEDIA") {
    return (
      <Link
        {...props}
        params={{ mediaId: target.id }}
        search={{ tab: "comments", comment: commentId }}
        to="/media/$mediaId"
      >
        {children}
      </Link>
    )
  }

  if (target.type === "CHAPTER") {
    return (
      <Link
        {...props}
        params={{ chapterId: target.id }}
        search={{ comment: commentId }}
        to="/chapters/$chapterId"
      >
        {children}
      </Link>
    )
  }

  if (target.type === "GROUP") {
    return (
      <Link
        {...props}
        params={{ groupId: target.id }}
        search={{ comment: commentId }}
        to="/groups/$groupId"
      >
        {children}
      </Link>
    )
  }

  return (
    <Link
      {...props}
      params={{ username: target.username ?? "" }}
      search={{ tab: "comments", comment: commentId }}
      to="/users/$username"
    >
      {children}
    </Link>
  )
}

export function CommentReportTarget({
  target,
  commentId,
  linkProps,
}: {
  target: ReportedComment["target"]
  commentId: string
  linkProps: ReturnType<typeof stylex.props>
}) {
  return (
    <CommentTargetLink commentId={commentId} target={target} {...linkProps}>
      {`${COMMENT_TARGET_LABELS[target.type]()} · ${target.label ?? m.media_untitled()}`}
    </CommentTargetLink>
  )
}
