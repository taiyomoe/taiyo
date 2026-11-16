import {
  CONTENT_RATINGS,
  type ContentRating,
  MEDIA_LANGUAGES,
  type MediaLanguage,
} from "@taiyomoe/db/constants"
import { Languages, Shield } from "@taiyomoe/ui/components/icons"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"
import { useBulkUpdateCovers } from "@/features/catalog/api/catalog"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { CatalogSelectControl } from "@/features/catalog/components/shared/catalog-toolbar"
import { RatingIcon } from "@/features/catalog/components/shared/rating-icon"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
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
        <CatalogSelectControl
          allLabel={m.catalog_bulk_unchanged()}
          getLabel={getLanguageName}
          icon={Languages}
          label={m.upload_language()}
          onChange={setLanguage}
          options={MEDIA_LANGUAGES}
          renderIcon={(option) => <LanguageFlag language={option} />}
          value={language}
        />
      </Field>
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
