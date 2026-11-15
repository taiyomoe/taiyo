import type { ContentRating } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { ListCardSkeleton } from "@/components/layout/list-card-skeleton"
import { useUploadBanners } from "@/features/media-images/api/media-images"
import { CurrentBanners } from "@/features/media-images/components/banners/current-banners"
import { StagedBannerRow } from "@/features/media-images/components/banners/staged-banner-row"
import { ImageDropZone } from "@/features/media-images/components/shared/image-drop-zone"
import { StagedUploadPanel } from "@/features/media-images/components/shared/staged-upload-panel"
import { useStagedImages } from "@/features/media-images/hooks/use-staged-images"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
})

export function BannersManager({
  mediaId,
  title,
  contentRating,
}: {
  mediaId: string
  title: string
  contentRating: ContentRating
}) {
  const media = useQuery(mediaQueryOptions(mediaId))
  const staged = useStagedImages<{ contentRating: ContentRating }>(() => ({ contentRating }))
  const upload = useUploadBanners(mediaId)
  const [progress, setProgress] = useState(0)

  return (
    <div sx={styles.root}>
      <ImageDropZone
        hint={m.media_banners_drop_hint()}
        onFiles={staged.add}
        rejected={staged.rejected}
        title={m.media_banners_drop_title()}
      />
      {staged.items.length === 0 ? null : (
        <StagedUploadPanel
          blocked={false}
          count={staged.items.length}
          error={upload.isError ? getErrorMessage(upload.error) : null}
          onClear={() => {
            staged.clear()
            upload.reset()
          }}
          onUpload={() => {
            setProgress(0)
            upload.mutate(
              {
                banners: staged.items.map((item) => ({
                  file: item.file,
                  contentRating: item.contentRating,
                })),
                onProgress: setProgress,
              },
              {
                onSuccess: () => {
                  toastManager.add({
                    title: m.media_images_uploaded({ count: staged.items.length }),
                    type: "success",
                  })
                  staged.clear()
                },
              },
            )
          }}
          progress={progress}
          title={m.media_banners_staged()}
          uploading={upload.isPending}
        >
          {staged.items.map((item) => (
            <StagedBannerRow
              key={item.key}
              disabled={upload.isPending}
              item={item}
              onChange={(next) => {
                staged.update(item.key, { contentRating: next })
              }}
              onRemove={() => {
                staged.remove(item.key)
              }}
            />
          ))}
        </StagedUploadPanel>
      )}
      {media.data === undefined ? (
        <ListCardSkeleton />
      ) : (
        <CurrentBanners banners={media.data.banners} mediaId={mediaId} title={title} />
      )}
    </div>
  )
}
