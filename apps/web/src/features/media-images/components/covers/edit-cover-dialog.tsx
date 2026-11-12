import type { ContentRating, Language } from "@taiyomoe/db/constants"
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
import { Input } from "@taiyomoe/ui/components/ui/input"
import { useState } from "react"
import type { MediaCover } from "@/features/media/lib/media-images"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { LanguagePicker } from "@/components/fields/language-picker"
import { useUpdateCover } from "@/features/media-images/api/media-images"
import { ContentRatingSelect } from "@/features/media-images/components/shared/content-rating-select"
import { parseVolumeInput } from "@/features/media-images/lib/staged-cover"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  fields: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function EditCoverDialog({
  mediaId,
  cover,
  onClose,
}: {
  mediaId: string
  cover: MediaCover | null
  onClose: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={cover !== null}
    >
      <DialogPopup>
        {cover === null ? null : (
          <EditCoverForm key={cover.id} cover={cover} mediaId={mediaId} onDone={onClose} />
        )}
      </DialogPopup>
    </Dialog>
  )
}

function EditCoverForm({
  mediaId,
  cover,
  onDone,
}: {
  mediaId: string
  cover: MediaCover
  onDone: () => void
}) {
  const update = useUpdateCover(mediaId)
  const [volume, setVolume] = useState(cover.volume ?? "")
  const [language, setLanguage] = useState<Language>(cover.language)
  const [contentRating, setContentRating] = useState<ContentRating>(cover.contentRating)
  const parsedVolume = parseVolumeInput(volume)

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()

        if (parsedVolume === undefined) {
          return
        }

        update.mutate(
          { id: cover.id, patch: { volume: parsedVolume, language, contentRating } },
          { onSuccess: onDone },
        )
      }}
    >
      <DialogHeader>
        <DialogTitle>{m.media_covers_edit_title()}</DialogTitle>
        <DialogDescription>{m.media_covers_edit_description()}</DialogDescription>
      </DialogHeader>
      <DialogPanel>
        <div sx={styles.fields}>
          <ErrorAlert message={update.isError ? getErrorMessage(update.error) : null} />
          <Field invalid={parsedVolume === undefined}>
            <FieldLabel>{m.media_images_volume()}</FieldLabel>
            <Input
              inputMode="decimal"
              onChange={(event) => {
                setVolume(event.target.value)
              }}
              placeholder={m.media_images_volume_placeholder()}
              value={volume}
            />
            {parsedVolume === undefined ? (
              <FieldError match>{m.media_images_volume_invalid()}</FieldError>
            ) : (
              <FieldDescription>{m.media_images_volume_hint()}</FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel>{m.upload_language()}</FieldLabel>
            <LanguagePicker onChange={setLanguage} value={language} />
          </Field>
          <Field>
            <FieldLabel>{m.media_images_content_rating()}</FieldLabel>
            <ContentRatingSelect onChange={setContentRating} value={contentRating} />
          </Field>
        </div>
      </DialogPanel>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>{m.cancel()}</DialogClose>
        <Button disabled={parsedVolume === undefined} loading={update.isPending} type="submit">
          {m.media_images_save()}
        </Button>
      </DialogFooter>
    </form>
  )
}
