import * as stylex from "@stylexjs/stylex"
import { ChevronDown } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useInfiniteQuery } from "@tanstack/react-query"
import { memo, useState } from "react"
import { uniqueBy } from "remeda"
import {
  type Comment,
  commentRepliesQueryOptions,
  type RootComment,
  useCreateReply,
} from "@/features/comments/api/comments"
import { CommentComposer } from "@/features/comments/components/comment-composer"
import { CommentItem } from "@/features/comments/components/comment-item"
import { useCommentsContext } from "@/features/comments/lib/comments-context"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  thread: {
    containIntrinsicSize: "auto 9rem",
    contentVisibility: "auto",
    display: "flex",
    flexDirection: "column",
    borderTopColor: { default: colors.border, ":first-child": "transparent" },
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  replies: {
    display: "flex",
    flexDirection: "column",
    paddingInlineStart: { default: "2.75rem", [breakpoints.sm]: "3.375rem" },
  },
  more: {
    alignSelf: "flex-start",
    color: colors.mutedForeground,
    marginBottom: "0.5rem",
  },
  composer: {
    paddingBottom: "1rem",
  },
})

export const CommentThread = memo(function CommentThread({
  root,
  highlightedId = null,
}: {
  root: RootComment
  highlightedId?: string | null
}) {
  const { viewer } = useCommentsContext()
  const [expanded, setExpanded] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const create = useCreateReply(root.id)
  const query = useInfiniteQuery({ ...commentRepliesQueryOptions(root.id), enabled: expanded })
  const fetched = query.data?.pages.flatMap((page) => page.data) ?? []
  const replies = expanded
    ? uniqueBy([...fetched, ...root.replies], (reply) => reply.id)
    : root.replies
  const hidden = Math.max(root.replyCount - replies.length, 0)
  const startReply = (target: Comment) =>
    viewer === null || target.removal !== null
      ? null
      : () => {
          setReplyingTo(target)
          create.reset()
        }

  return (
    <div sx={styles.thread}>
      <CommentItem
        comment={root}
        highlighted={root.id === highlightedId}
        onReply={startReply(root)}
      />
      {replies.length > 0 || hidden > 0 || replyingTo !== null ? (
        <div sx={styles.replies}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              highlighted={reply.id === highlightedId}
              onReply={startReply(reply)}
            />
          ))}
          {hidden > 0 && (!expanded || query.hasNextPage) ? (
            <Button
              loading={query.isFetching}
              onClick={() => {
                if (expanded) {
                  void query.fetchNextPage()
                } else {
                  setExpanded(true)
                }
              }}
              size="sm"
              sx={styles.more}
              variant="ghost"
            >
              <ChevronDown />
              {hidden === 1 ? m.comments_more_reply() : m.comments_more_replies({ count: hidden })}
            </Button>
          ) : null}
          {replyingTo === null ? null : (
            <div sx={styles.composer}>
              <CommentComposer
                key={replyingTo.id}
                autoFocus
                error={create.isError ? getErrorMessage(create.error) : null}
                onCancel={() => {
                  setReplyingTo(null)
                }}
                onSubmit={(content) =>
                  create.mutateAsync({ replyTo: replyingTo.id, content }).then(() => {
                    setReplyingTo(null)
                  })
                }
                pending={create.isPending}
                placeholder={m.comments_reply_placeholder({
                  name: replyingTo.author?.displayUsername ?? "",
                })}
                rows={2}
                submitLabel={m.comments_reply()}
              />
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
})
