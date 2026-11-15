import * as stylex from "@stylexjs/stylex"
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { commentRevisionsQueryOptions } from "@/features/comments/api/comments"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  panel: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  version: {
    padding: "0.875rem",
    borderRadius: radius.lg,
    gap: "0.5rem",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    flexDirection: "column",
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  current: {
    color: colors.foreground,
  },
  source: {
    margin: 0,
    color: colors.foreground,
    fontFamily: "inherit",
    fontSize: "0.875rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  skeleton: {
    borderRadius: radius.lg,
    height: "5rem",
  },
})

function RevisionsBody({ commentId }: { commentId: string }) {
  const query = useQuery(commentRevisionsQueryOptions(commentId))

  if (query.isPending) {
    return <Skeleton sx={styles.skeleton} />
  }

  if (query.isError) {
    return <ErrorAlert message={getErrorMessage(query.error)} />
  }

  const { current, revisions } = query.data

  return (
    <>
      <div sx={styles.version}>
        <span sx={[styles.meta, styles.current]}>
          {current.deletedAt === null
            ? m.comments_history_current()
            : m.comments_history_removed({
                date: new Date(current.deletedAt).toLocaleString(getLocale()),
              })}
          {" · "}
          {new Date(current.writtenAt).toLocaleString(getLocale())}
        </span>
        <pre sx={styles.source}>{current.content}</pre>
      </div>
      {revisions.map((revision) => (
        <div key={revision.writtenAt} sx={styles.version}>
          <span sx={styles.meta}>{new Date(revision.writtenAt).toLocaleString(getLocale())}</span>
          <pre sx={styles.source}>{revision.content}</pre>
        </div>
      ))}
    </>
  )
}

export function CommentRevisionsDialog({
  commentId,
  onClose,
}: {
  commentId: string | null
  onClose: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={commentId !== null}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.comments_history_title()}</DialogTitle>
          <DialogDescription>{m.comments_history_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel sx={styles.panel}>
          {commentId === null ? null : <RevisionsBody commentId={commentId} />}
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}
