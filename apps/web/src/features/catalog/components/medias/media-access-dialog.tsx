import type { Flag } from "@taiyomoe/db/constants"
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useState } from "react"
import type { ManagedMedia } from "@/features/catalog/api/catalog"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { OptionSelect } from "@/components/fields/option-select"
import { useFlagMedia } from "@/features/catalog/api/catalog"
import { MEDIA_FLAG_OPTIONS } from "@/features/media/lib/media-options"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const REASON_MAX_LENGTH = 500
const styles = stylex.create({
  form: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function MediaAccessDialog({
  media,
  onClose,
}: {
  media: Pick<ManagedMedia, "id" | "title" | "flag"> | null
  onClose: () => void
}) {
  const flagMedia = useFlagMedia()
  const [flag, setFlag] = useState<Flag | null>(null)
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)
  const title = media?.title ?? m.media_untitled()
  const picked = flag ?? media?.flag ?? "OK"
  const missingReason = touched && reason.trim() === ""
  const close = () => {
    setFlag(null)
    setReason("")
    setTouched(false)
    flagMedia.reset()
    onClose()
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          close()
        }
      }}
      open={media !== null}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.catalog_media_access_title({ title })}</DialogTitle>
          <DialogDescription>{m.catalog_media_access_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={styles.form}>
            <ErrorAlert message={flagMedia.isError ? getErrorMessage(flagMedia.error) : null} />
            <Field>
              <FieldLabel>{m.media_info_flag()}</FieldLabel>
              <OptionSelect
                label={m.media_info_flag()}
                onChange={setFlag}
                options={MEDIA_FLAG_OPTIONS}
                value={picked}
              />
              {picked === "LOCKED" ? (
                <FieldDescription>{m.catalog_media_bulk_locked_hint()}</FieldDescription>
              ) : null}
            </Field>
            <Field invalid={missingReason}>
              <FieldLabel>{m.catalog_media_access_reason()}</FieldLabel>
              <Textarea
                maxLength={REASON_MAX_LENGTH}
                onChange={(event) => {
                  setReason(event.target.value)
                }}
                placeholder={m.catalog_media_access_reason_placeholder()}
                rows={3}
                value={reason}
              />
              {missingReason ? (
                <FieldError match>{m.catalog_media_access_reason_required()}</FieldError>
              ) : null}
            </Field>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={flagMedia.isPending || picked === media?.flag}
            onClick={() => {
              setTouched(true)

              if (media !== null && reason.trim() !== "") {
                flagMedia.mutate(
                  { id: media.id, flag: picked, reason: reason.trim() },
                  {
                    onSuccess: () => {
                      toastManager.add({
                        title: m.catalog_media_access_updated({ title }),
                        type: "success",
                      })
                      close()
                    },
                  },
                )
              }
            }}
          >
            {m.catalog_media_change_access()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
