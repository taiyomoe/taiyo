import type { ContentRating, MediaLanguage } from "@taiyomoe/db/constants"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import { MEDIA_LANGUAGE_OPTIONS } from "@/components/fields/language-options"
import { OptionalOptionSelect } from "@/components/fields/option-select"
import { useBulkUpdateCovers } from "@/features/catalog/api/catalog"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { CONTENT_RATING_OPTIONS } from "@/features/media/lib/media-options"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function BulkEditCoversDialog({
  coverIds,
  onClose,
  onDone,
}: {
  coverIds: readonly string[] | null
  onClose: () => void
  onDone: () => void
}) {
  const update = useBulkUpdateCovers()
  const [language, setLanguage] = useState<MediaLanguage | undefined>()
  const [contentRating, setContentRating] = useState<ContentRating | undefined>()
  const changes = {
    ...(language === undefined ? {} : { language }),
    ...(contentRating === undefined ? {} : { contentRating }),
  }
  const close = () => {
    update.reset()
    setLanguage(undefined)
    setContentRating(undefined)
    onClose()
  }

  return (
    <BulkEditDialog
      changed={Object.keys(changes).length > 0}
      error={update.isError ? getErrorMessage(update.error) : null}
      onClose={close}
      onSubmit={() => {
        if (coverIds !== null) {
          update.mutate(
            { coverIds: [...coverIds], ...changes },
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
      open={coverIds !== null}
      pending={update.isPending}
      title={m.catalog_cover_bulk_edit_title({ count: coverIds?.length ?? 0 })}
    >
      <Field>
        <FieldLabel>{m.upload_language()}</FieldLabel>
        <OptionalOptionSelect
          empty={m.catalog_bulk_unchanged()}
          label={m.upload_language()}
          onChange={setLanguage}
          options={MEDIA_LANGUAGE_OPTIONS}
          value={language}
        />
      </Field>
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
