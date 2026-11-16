import {
  CONTENT_RATINGS,
  type ContentRating,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  type MediaCountryOfOrigin,
  type MediaDemography,
  type MediaSource,
  type MediaStatus,
  type MediaType,
} from "@taiyomoe/db/constants"
import { Activity, Book, Globe, Shield, Sparkles, Users } from "@taiyomoe/ui/components/icons"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import { CountryFlag } from "@/components/flags/flags"
import { useBulkUpdateMedias } from "@/features/catalog/api/catalog"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import {
  CatalogSelectControl,
  StatusDot,
} from "@/features/catalog/components/shared/catalog-toolbar"
import { RatingIcon } from "@/features/catalog/components/shared/rating-icon"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import {
  CONTENT_RATING_LABELS,
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_SOURCE_LABELS,
  MEDIA_STATUS_BADGES,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/features/media/lib/media-labels"
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
        <CatalogSelectControl
          allLabel={keep}
          getLabel={(type) => MEDIA_TYPE_LABELS[type]()}
          icon={Book}
          label={m.media_info_type()}
          onChange={(type) => {
            set({ type })
          }}
          options={MEDIA_TYPES}
          value={changes.type}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_status()}</FieldLabel>
        <CatalogSelectControl
          allLabel={keep}
          getLabel={(status) => MEDIA_STATUS_LABELS[status]()}
          icon={Activity}
          label={m.media_info_status()}
          onChange={(status) => {
            set({ status })
          }}
          options={MEDIA_STATUSES}
          renderIcon={(status) => <StatusDot variant={MEDIA_STATUS_BADGES[status]} />}
          value={changes.status}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_source()}</FieldLabel>
        <CatalogSelectControl
          allLabel={keep}
          getLabel={(source) => MEDIA_SOURCE_LABELS[source]()}
          icon={Sparkles}
          label={m.media_info_source()}
          onChange={(source) => {
            set({ source })
          }}
          options={MEDIA_SOURCES}
          value={changes.source}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_demography()}</FieldLabel>
        <CatalogSelectControl
          allLabel={keep}
          getLabel={(demography) => MEDIA_DEMOGRAPHY_LABELS[demography]()}
          icon={Users}
          label={m.media_info_demography()}
          onChange={(demography) => {
            set({ demography })
          }}
          options={MEDIA_DEMOGRAPHIES}
          value={changes.demography}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_country()}</FieldLabel>
        <CatalogSelectControl
          allLabel={keep}
          getLabel={(country) => MEDIA_COUNTRY_LABELS[country]()}
          icon={Globe}
          label={m.media_info_country()}
          onChange={(countryOfOrigin) => {
            set({ countryOfOrigin })
          }}
          options={MEDIA_COUNTRIES_OF_ORIGIN}
          renderIcon={(country) => <CountryFlag country={country} />}
          value={changes.countryOfOrigin}
        />
      </Field>
      <Field>
        <FieldLabel>{m.media_info_content_rating()}</FieldLabel>
        <CatalogSelectControl
          allLabel={keep}
          getLabel={(rating) => CONTENT_RATING_LABELS[rating]()}
          icon={Shield}
          label={m.media_info_content_rating()}
          onChange={(contentRating) => {
            set({ contentRating })
          }}
          options={CONTENT_RATINGS}
          renderIcon={(rating) => <RatingIcon rating={rating} />}
          value={changes.contentRating}
        />
      </Field>
    </BulkEditDialog>
  )
}
