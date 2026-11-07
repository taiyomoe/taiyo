import { Ellipsis } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useState } from "react"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { type Comment, useDeleteComment } from "@/features/comments/api/comments"
import { CommentRevisionsDialog } from "@/features/comments/components/comment-revisions-dialog"
import { ReportCommentDialog } from "@/features/comments/components/report-comment-dialog"
import { useCommentsContext } from "@/features/comments/lib/comments-context"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function CommentMenu({ comment, onEdit }: { comment: Comment; onEdit: () => void }) {
  const { canReview, getPermalink } = useCommentsContext()
  const remove = useDeleteComment()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [reporting, setReporting] = useState(false)
  const [history, setHistory] = useState(false)
  const visible = comment.removal === null

  return (
    <>
      <Menu>
        <MenuTrigger
          render={<Button aria-label={m.comments_more()} size="icon-xs" variant="ghost" />}
        >
          <Ellipsis />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuGroup>
            {visible ? (
              <MenuItem
                onClick={() => {
                  void navigator.clipboard
                    .writeText(new URL(getPermalink(comment.id), window.location.origin).href)
                    .then(() => {
                      toastManager.add({ title: m.comments_link_copied(), type: "success" })
                    })
                }}
              >
                {m.comments_copy_link()}
              </MenuItem>
            ) : null}
            {comment.canEdit ? <MenuItem onClick={onEdit}>{m.comments_edit()}</MenuItem> : null}
            {canReview ? (
              <MenuItem
                onClick={() => {
                  setHistory(true)
                }}
              >
                {m.comments_history()}
              </MenuItem>
            ) : null}
            {comment.canReport ? (
              <MenuItem
                onClick={() => {
                  setReporting(true)
                }}
              >
                {m.comments_report()}
              </MenuItem>
            ) : null}
          </MenuGroup>
          {comment.canDelete ? (
            <>
              <MenuSeparator />
              <MenuGroup>
                <MenuItem
                  onClick={() => {
                    setConfirmation({
                      title: m.comments_delete_title(),
                      description:
                        comment.replyCount > 0
                          ? m.comments_delete_description_replies()
                          : m.comments_delete_description(),
                      confirmLabel: m.comments_delete(),
                      destructive: true,
                      run: () => remove.mutateAsync(comment),
                    })
                  }}
                  variant="destructive"
                >
                  {m.comments_delete()}
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
      <ReportCommentDialog
        commentId={reporting ? comment.id : null}
        onClose={() => {
          setReporting(false)
        }}
      />
      <CommentRevisionsDialog
        commentId={history ? comment.id : null}
        onClose={() => {
          setHistory(false)
        }}
      />
    </>
  )
}
