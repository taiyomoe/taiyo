import type {
  ContentRating,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@taiyomoe/db/constants"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import { OptionalOptionSelect } from "@/components/fields/option-select"
import { useBulkUpdateMedias } from "@/features/catalog/api/catalog"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import {
  CONTENT_RATING_OPTIONS,
  MEDIA_COUNTRY_OPTIONS,
  MEDIA_DEMOGRAPHY_OPTIONS,
  MEDIA_SOURCE_OPTIONS,
  MEDIA_STATUS_OPTIONS,
  MEDIA_TYPE_OPTIONS,
} from "@/features/media/lib/media-options"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

type MediaChanges = {
  type?: MediaType | undefined
  status?: MediaStatus | undefined
  source?: MediaSource | undefined
  demography?: MediaDemography | undefined
  countryOfOrigin?: MediaCountryOfOrigin | undefined
  contentRating?: ContentRating | undefined
}

export function BulkEditMediasDialog({
  mediaIds,
  onClose,
  onDone,
}: {
  mediaIds: readonly string[] | null
  onClose: () => void
  onDone: () => void
}) {
  const update = useBulkUpdateMedias()
  const [changes, setChanges] = useState<MediaChanges>({})
  const set = (patch: MediaChanges) => {
    setChanges((current) => ({ ...current, ...patch }))
  }
  const defined = Object.fromEntries(
    Object.entries(changes).filter(([, value]) => value !== undefined),
  )
  const close = () => {
    update.reset()
    setChanges({})
    onClose()
  }
  const keep = m.catalog_bulk_unchanged()

  return (
    <BulkEditDialog
      changed={Object.keys(defined).length > 0}
      error={update.isError ? getErrorMessage(update.error) : null}
      onClose={close}
      onSubmit={() => {
        if (mediaIds !== null) {
          update.mutate(
            { mediaIds: [...mediaIds], ...defined },
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
      open={mediaIds !== null}
      pending={update.isPending}
      title={m.catalog_media_bulk_edit_title({ count: mediaIds?.length ?? 0 })}
    >
      <Field>
        <FieldLabel>{m.media_info_type()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.media_info_type()}
          onChange={(type) => {
            set({ type })
          }}
          options={MEDIA_TYPE_OPTIONS}
          value={changes.type}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_status()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.media_info_status()}
          onChange={(status) => {
            set({ status })
          }}
          options={MEDIA_STATUS_OPTIONS}
          value={changes.status}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_source()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.media_info_source()}
          onChange={(source) => {
            set({ source })
          }}
          options={MEDIA_SOURCE_OPTIONS}
          value={changes.source}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_demography()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.media_info_demography()}
          onChange={(demography) => {
            set({ demography })
          }}
          options={MEDIA_DEMOGRAPHY_OPTIONS}
          value={changes.demography}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_country()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.media_info_country()}
          onChange={(countryOfOrigin) => {
            set({ countryOfOrigin })
          }}
          options={MEDIA_COUNTRY_OPTIONS}
          value={changes.countryOfOrigin}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_content_rating()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.media_info_content_rating()}
          onChange={(contentRating) => {
            set({ contentRating })
          }}
          options={CONTENT_RATING_OPTIONS}
          value={changes.contentRating}
        />
      </Field>
    </BulkEditDialog>
  )
}
