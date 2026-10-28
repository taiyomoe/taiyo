import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Dialog, DialogPopup } from "@taiyomoe/ui/components/ui/dialog"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { ReviewForm } from "@/features/uploads/components/chapter-reviews/review-form"

const styles = stylex.create({
  popup: {
    maxWidth: "56rem",
  },
})

export function ReviewDialog({
  submission,
  can,
  onClose,
}: {
  submission: ChapterSubmission | null
  can: Permissions
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
      <DialogPopup sx={styles.popup}>
        {submission === null ? null : (
          <ReviewForm can={can} onDone={onClose} submission={submission} />
        )}
      </DialogPopup>
    </Dialog>
  )
}
