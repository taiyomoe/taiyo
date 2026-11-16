import { CONTENT_RATINGS, type ContentRating } from "@taiyomoe/db/constants"
import { Shield } from "@taiyomoe/ui/components/icons"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import { useBulkUpdateBanners } from "@/features/catalog/api/catalog"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { CatalogSelectControl } from "@/features/catalog/components/shared/catalog-toolbar"
import { RatingIcon } from "@/features/catalog/components/shared/rating-icon"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
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
        <CatalogSelectControl
          allLabel={m.catalog_bulk_unchanged()}
          getLabel={(rating) => CONTENT_RATING_LABELS[rating]()}
          icon={Shield}
          label={m.media_images_content_rating()}
          onChange={setContentRating}
          options={CONTENT_RATINGS}
          renderIcon={(rating) => <RatingIcon rating={rating} />}
          value={contentRating}
        />
      </Field>
    </BulkEditDialog>
  )
}
