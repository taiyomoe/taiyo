import * as stylex from "@stylexjs/stylex"
import { CloudUpload } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { formatDateTime } from "@/components/fields/date-time-picker"
import { submissionLabel } from "@/features/uploads/components/submission-cells"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  note: {
    margin: 0,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.75rem",
    paddingInline: "0.875rem",
    backgroundColor: colors.muted,
    fontSize: "0.875rem",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  reviewed: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    marginTop: "0.75rem",
  },
})

/** The reviewer's whole note on a rejected submission. */
export function RejectionNoteDialog({
  submission,
  onClose,
}: {
  submission: ChapterSubmission | null
  onClose: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={submission !== null}
    >
      <DialogPopup>
        {submission === null ? null : (
          <>
            <DialogHeader>
              <DialogTitle>
                {m.submissions_note_title({ name: submissionLabel(submission) })}
              </DialogTitle>
              <DialogDescription>{m.submissions_note_description()}</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <p sx={styles.note}>{submission.rejectionReason}</p>
              {submission.reviewedAt === null ? null : (
                <p sx={styles.reviewed}>
                  {m.submissions_note_reviewed({
                    date: formatDateTime(new Date(submission.reviewedAt)),
                  })}
                </p>
              )}
            </DialogPanel>
            <DialogFooter>
              <Button render={<Link to="/dashboard/upload" />}>
                <CloudUpload />
                {m.dashboard_nav_upload()}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogPopup>
    </Dialog>
  )
}
