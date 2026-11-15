import type { ContentRating } from "@taiyomoe/db/constants"
import { MEDIA_EDIT_FIELDS } from "@taiyomoe/db/constants"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import type { StagedCoverFields } from "@/features/media-images/lib/staged-cover"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { useCreateMedia } from "@/features/catalog/api/catalog"
import { NewMediaFooter } from "@/features/catalog/components/medias/new-media-footer"
import {
  NewMediaBanners,
  NewMediaCovers,
} from "@/features/catalog/components/medias/new-media-images"
import { BackLink } from "@/features/catalog/components/shared/back-link"
import { buildMediaForm, getMediaImagesError } from "@/features/catalog/lib/media-form"
import { useStagedImages } from "@/features/media-images/hooks/use-staged-images"
import { parseCoverVolume } from "@/features/media-images/lib/parse-cover-volume"
import { parseVolumeInput } from "@/features/media-images/lib/staged-cover"
import { MediaEditSections } from "@/features/media-suggestions/components/media-edit/media-edit-sections"
import { getFieldsError, toDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const IMAGE_ERRORS = {
  "missing-cover": m.catalog_media_new_missing_cover,
  "invalid-volume": m.media_images_volume_invalid,
  "main-cover": m.catalog_media_new_main_cover,
} as const

export function NewMediaPage() {
  const navigate = useNavigate()
  const create = useCreateMedia()
  const [draft, setDraft] = useState(() =>
    toDraft({ titles: [{ title: "", language: "en", isMainTitle: true, isAcronym: false }] }),
  )
  const covers = useStagedImages<StagedCoverFields>((file, index) => ({
    volume: parseCoverVolume(file.name),
    language: "ja",
    contentRating: draft.contentRating,
    main: index === 0,
  }))
  const banners = useStagedImages<{ contentRating: ContentRating }>(() => ({
    contentRating: draft.contentRating,
  }))
  const parsedCovers = covers.items.map((item) => ({
    file: item.file,
    volume: parseVolumeInput(item.volume),
    language: item.language,
    contentRating: item.contentRating,
    main: item.main,
  }))
  const imagesError = getMediaImagesError(parsedCovers)
  const error =
    getFieldsError(draft, MEDIA_EDIT_FIELDS) ??
    (imagesError === null ? null : IMAGE_ERRORS[imagesError]())

  return (
    <DashboardPage
      eyebrow={<BackLink label={m.dashboard_nav_media()} to="/dashboard/medias" />}
      subtitle={m.catalog_media_new_subtitle()}
      title={m.catalog_media_add()}
    >
      <ErrorAlert message={create.isError ? getErrorMessage(create.error) : null} />
      <MediaEditSections changed={[]} draft={draft} onChange={setDraft} />
      <NewMediaCovers disabled={create.isPending} staged={covers} />
      <NewMediaBanners disabled={create.isPending} staged={banners} />
      <NewMediaFooter
        error={error}
        onSubmit={() => {
          create.mutate(
            buildMediaForm(
              draft,
              parsedCovers.map(({ volume, ...cover }) => ({ ...cover, volume: volume ?? null })),
              banners.items,
            ),
            {
              onSuccess: ({ id }) => {
                void navigate({ to: "/media/$mediaId", params: { mediaId: id } })
              },
            },
          )
        }}
        pending={create.isPending}
      />
    </DashboardPage>
  )
}
