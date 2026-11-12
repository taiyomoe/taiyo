import type { ContentRating } from "@taiyomoe/db/constants"
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
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import type { MediaBanner } from "@/features/media/lib/media-images"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { useUpdateBanner } from "@/features/media-images/api/media-images"
import { ContentRatingSelect } from "@/features/media-images/components/shared/content-rating-select"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function EditBannerDialog({
  mediaId,
  banner,
  onClose,
}: {
  mediaId: string
  banner: MediaBanner | null
  onClose: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={banner !== null}
    >
      <DialogPopup>
        {banner === null ? null : (
          <EditBannerForm key={banner.id} banner={banner} mediaId={mediaId} onDone={onClose} />
        )}
      </DialogPopup>
    </Dialog>
  )
}

function EditBannerForm({
  mediaId,
  banner,
  onDone,
}: {
  mediaId: string
  banner: MediaBanner
  onDone: () => void
}) {
  const update = useUpdateBanner(mediaId)
  const [contentRating, setContentRating] = useState<ContentRating>(banner.contentRating)

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        update.mutate({ id: banner.id, contentRating }, { onSuccess: onDone })
      }}
    >
      <DialogHeader>
        <DialogTitle>{m.media_banners_edit_title()}</DialogTitle>
        <DialogDescription>{m.media_banners_edit_description()}</DialogDescription>
      </DialogHeader>
      <DialogPanel>
        <ErrorAlert message={update.isError ? getErrorMessage(update.error) : null} />
        <Field>
          <FieldLabel>{m.media_images_content_rating()}</FieldLabel>
          <ContentRatingSelect onChange={setContentRating} value={contentRating} />
        </Field>
      </DialogPanel>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>{m.cancel()}</DialogClose>
        <Button loading={update.isPending} type="submit">
          {m.media_images_save()}
        </Button>
      </DialogFooter>
    </form>
  )
}
