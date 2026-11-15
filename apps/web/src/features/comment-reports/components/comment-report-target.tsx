import type * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import type { ReportedComment } from "@/features/comment-reports/api/comment-reports"
import { m } from "@/paraglide/messages"

const TYPE_LABELS = {
  MEDIA: m.comment_reports_target_media,
  CHAPTER: m.comment_reports_target_chapter,
  GROUP: m.comment_reports_target_group,
  USER: m.comment_reports_target_user,
} satisfies Record<ReportedComment["target"]["type"], () => string>

export function CommentReportTarget({
  target,
  commentId,
  linkProps,
}: {
  target: ReportedComment["target"]
  commentId: string
  linkProps: ReturnType<typeof stylex.props>
}) {
  const label = `${TYPE_LABELS[target.type]()} · ${target.label ?? m.media_untitled()}`

  if (target.type === "MEDIA") {
    return (
      <Link
        params={{ mediaId: target.id }}
        search={{ tab: "comments", comment: commentId }}
        to="/media/$mediaId"
        {...linkProps}
      >
        {label}
      </Link>
    )
  }

  if (target.type === "CHAPTER") {
    return (
      <Link
        params={{ chapterId: target.id }}
        search={{ comment: commentId }}
        to="/chapters/$chapterId"
        {...linkProps}
      >
        {label}
      </Link>
    )
  }

  if (target.type === "GROUP") {
    return (
      <Link
        params={{ groupId: target.id }}
        search={{ comment: commentId }}
        to="/groups/$groupId"
        {...linkProps}
      >
        {label}
      </Link>
    )
  }

  return (
    <Link
      params={{ username: target.username ?? "" }}
      search={{ tab: "comments", comment: commentId }}
      to="/users/$username"
      {...linkProps}
    >
      {label}
    </Link>
  )
}
