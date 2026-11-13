import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import type { Notification } from "@/features/notifications/api/notifications"

type CommentTarget = Extract<Notification, { type: "COMMENT_REPLY" }>["comment"]["target"]
type LinkProps = {
  children?: ReactNode
  onClick?: () => void
  sx?: Sx
  "aria-label"?: string
  "data-primary"?: string
}

/** Opens a comment in its thread, wherever the thread lives. */
export function CommentLink({
  target,
  commentId,
  sx,
  ...props
}: LinkProps & { target: CommentTarget; commentId: string }) {
  const shared = { ...props, ...stylex.props(sx) }

  if (target.type === "MEDIA") {
    return (
      <Link
        {...shared}
        params={{ mediaId: target.id }}
        search={{ tab: "comments", comment: commentId }}
        to="/media/$mediaId"
      />
    )
  }

  if (target.type === "CHAPTER") {
    return (
      <Link
        {...shared}
        params={{ chapterId: target.id }}
        search={{ comment: commentId }}
        to="/chapters/$chapterId"
      />
    )
  }

  if (target.type === "GROUP") {
    return (
      <Link
        {...shared}
        params={{ groupId: target.id }}
        search={{ tab: "comments", comment: commentId }}
        to="/groups/$groupId"
      />
    )
  }

  return (
    <Link
      {...shared}
      params={{ username: target.username ?? "" }}
      search={{ tab: "comments", comment: commentId }}
      to="/users/$username"
    />
  )
}
