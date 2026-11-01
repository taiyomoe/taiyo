import * as stylex from "@stylexjs/stylex"
import { Dialog, DialogPopup } from "@taiyomoe/ui/components/ui/dialog"
import {
  EditChapterForm,
  type EditableChapter,
} from "@/features/groups/components/manage-group/chapters/edit-chapter-form"

const styles = stylex.create({
  popup: {
    maxWidth: "52rem",
  },
})

export function EditChapterDialog({
  chapter,
  onClose,
}: {
  chapter: EditableChapter | null
  onClose: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={chapter !== null}
    >
      <DialogPopup sx={styles.popup}>
        {chapter === null ? null : <EditChapterForm chapter={chapter} onDone={onClose} />}
      </DialogPopup>
    </Dialog>
  )
}
