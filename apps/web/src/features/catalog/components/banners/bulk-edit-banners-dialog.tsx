import type { ContentRating } from "@taiyomoe/db/constants"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import { OptionalOptionSelect } from "@/components/fields/option-select"
import { useBulkUpdateBanners } from "@/features/catalog/api/catalog"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { CONTENT_RATING_OPTIONS } from "@/features/media/lib/media-options"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function BulkEditBannersDialog({
  bannerIds,
  onClose,
  onDone,
}: {
  bannerIds: readonly string[] | null
  onClose: () => void
  onDone: () => void
}) {
  const update = useBulkUpdateBanners()
  const [contentRating, setContentRating] = useState<ContentRating | undefined>()
  const close = () => {
    update.reset()
    setContentRating(undefined)
    onClose()
  }

  return (
    <BulkEditDialog
      changed={contentRating !== undefined}
      error={update.isError ? getErrorMessage(update.error) : null}
      onClose={close}
      onSubmit={() => {
        if (bannerIds !== null && contentRating !== undefined) {
          update.mutate(
            { bannerIds: [...bannerIds], contentRating },
            {
              onSuccess: (result) => {
                toastBulkResult(result, m.catalog_bulk_updated)
                onDone()
                close()
              },
            },
          )
        }
      }}
      open={bannerIds !== null}
      pending={update.isPending}
      title={m.catalog_banner_bulk_edit_title({ count: bannerIds?.length ?? 0 })}
    >
      <Field>
        <FieldLabel>{m.media_images_content_rating()}</FieldLabel>
        <OptionalOptionSelect
          empty={m.catalog_bulk_unchanged()}
          label={m.media_images_content_rating()}
          onChange={setContentRating}
          options={CONTENT_RATING_OPTIONS}
          value={contentRating}
        />
      </Field>
    </BulkEditDialog>
  )
}
