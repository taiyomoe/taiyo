import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { type Comment, useUpdateComment } from "@/features/comments/api/comments"
import { CommentActions } from "@/features/comments/components/comment-actions"
import { CommentComposer } from "@/features/comments/components/comment-composer"
import { CommentContent } from "@/features/comments/components/comment-content"
import { CommentHeader } from "@/features/comments/components/comment-header"
import { commentStyles } from "@/features/comments/components/comment-styles"
import { CommentTombstone } from "@/features/comments/components/comment-tombstone"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  replyTo: {
    borderRadius: radius.sm,
    gap: "0.25rem",
    textDecoration: "none",
    alignItems: "center",
    alignSelf: "flex-start",
    color: {
      default: colors.mutedForeground,
      ":hover": `color-mix(in srgb, ${colors.mutedForeground} 60%, ${colors.foreground})`,
    },
    display: "inline-flex",
    fontSize: "0.75rem",
  },
})

export function CommentItem({
  comment,
  highlighted = false,
  onReply,
}: {
  comment: Comment
  highlighted?: boolean
  onReply: (() => void) | null
}) {
  const update = useUpdateComment()
  const [editing, setEditing] = useState(false)
  const isReply = comment.parentId !== null

  if (comment.removal !== null || comment.author === null || comment.content === null) {
    return <CommentTombstone comment={comment} />
  }

  return (
    <article
      id={`comment-${comment.id}`}
      sx={[commentStyles.item, highlighted && commentStyles.highlighted]}
    >
      <Link params={{ username: comment.author.username }} tabIndex={-1} to="/users/$username">
        <PersonAvatar
          person={comment.author}
          sx={[commentStyles.avatar, isReply && commentStyles.replyAvatar]}
        />
      </Link>
      <div sx={commentStyles.body}>
        <CommentHeader comment={comment} />
        {comment.replyTo === null ? null : (
          <a
            href={`#comment-${comment.replyTo.id}`}
            onClick={(event) => {
              const target = document.getElementById(`comment-${comment.replyTo?.id ?? ""}`)

              event.preventDefault()
              target?.scrollIntoView({ behavior: "smooth", block: "center" })
            }}
            sx={styles.replyTo}
          >
            {comment.replyTo.author === null
              ? m.comments_replying_to_removed()
              : m.comments_replying_to({ name: comment.replyTo.author.displayUsername })}
          </a>
        )}
        {editing ? (
          <CommentComposer
            autoFocus
            error={update.isError ? getErrorMessage(update.error) : null}
            initialContent={comment.content}
            initialImages={comment.images}
            onCancel={() => {
              setEditing(false)
              update.reset()
            }}
            onSubmit={(content) =>
              update.mutateAsync({ id: comment.id, content }).then(() => {
                setEditing(false)
              })
            }
            pending={update.isPending}
            placeholder={m.comments_edit_placeholder()}
            submitLabel={m.comments_save()}
          />
        ) : (
          <>
            <CommentContent content={comment.content} images={comment.images} />
            <CommentActions
              comment={comment}
              onEdit={() => {
                setEditing(true)
              }}
              onReply={onReply}
            />
          </>
        )}
      </div>
    </article>
  )
}
