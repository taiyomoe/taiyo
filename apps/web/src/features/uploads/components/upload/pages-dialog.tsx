import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import type { UploadRow } from "@/features/uploads/lib/chapter-batch/upload-rows"
import { PagesPreview } from "@/features/uploads/components/upload/pages-preview"
import { m } from "@/paraglide/messages"

type PagesDialogProps = {
  row: UploadRow | undefined
  onClose: () => void
  onRowChange: (key: string, patch: Partial<UploadRow>) => void
}

const styles = stylex.create({
  popup: {
    maxWidth: "60rem",
  },
})

export function PagesDialog({ row, onClose, onRowChange }: PagesDialogProps) {
  const chapter =
    row?.source === undefined || row.source === null
      ? null
      : {
          key: row.key,
          number: row.number,
          source: row.source,
          pageKeys: row.pageKeys,
        }

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
        {chapter === null ? null : (
          <>
            <DialogHeader>
              <DialogTitle>{m.upload_pages_button({ number: chapter.number || "?" })}</DialogTitle>
              <DialogDescription>{m.upload_pages_dialog_description()}</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <PagesPreview
                onChange={(pageKeys) => {
                  onRowChange(chapter.key, { pageKeys })
                }}
                pageKeys={chapter.pageKeys}
                source={chapter.source}
              />
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button />}>{m.upload_done()}</DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogPopup>
    </Dialog>
  )
}
