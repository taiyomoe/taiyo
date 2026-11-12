import type { ContentRating, Language } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { StagedCoverFields } from "@/features/media-images/lib/staged-cover"
import { ListCardSkeleton } from "@/components/layout/list-card-skeleton"
import { useUploadCovers } from "@/features/media-images/api/media-images"
import { CurrentCovers } from "@/features/media-images/components/covers/current-covers"
import { StagedCoverRow } from "@/features/media-images/components/covers/staged-cover-row"
import { ImageDropZone } from "@/features/media-images/components/shared/image-drop-zone"
import { StagedUploadPanel } from "@/features/media-images/components/shared/staged-upload-panel"
import { useStagedImages } from "@/features/media-images/hooks/use-staged-images"
import { parseCoverVolume } from "@/features/media-images/lib/parse-cover-volume"
import { parseVolumeInput } from "@/features/media-images/lib/staged-cover"
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

export function CoversManager({
  mediaId,
  title,
  language,
  contentRating,
}: {
  mediaId: string
  title: string
  language: Language
  contentRating: ContentRating
}) {
  const media = useQuery(mediaQueryOptions(mediaId))
  const staged = useStagedImages<StagedCoverFields>((file) => ({
    volume: parseCoverVolume(file.name),
    language,
    contentRating,
    main: false,
  }))
  const upload = useUploadCovers(mediaId)
  const [progress, setProgress] = useState(0)
  const blocked =
    staged.items.length === 0 ||
    staged.items.some((item) => parseVolumeInput(item.volume) === undefined)

  return (
    <div sx={styles.root}>
      <ImageDropZone
        hint={m.media_covers_drop_hint()}
        onFiles={staged.add}
        rejected={staged.rejected}
        title={m.media_covers_drop_title()}
      />
      {staged.items.length === 0 ? null : (
        <StagedUploadPanel
          blocked={blocked}
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
                covers: staged.items.map((item) => ({
                  file: item.file,
                  volume: parseVolumeInput(item.volume) ?? null,
                  language: item.language,
                  contentRating: item.contentRating,
                  main: item.main,
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
          title={m.media_covers_staged()}
          uploading={upload.isPending}
        >
          {staged.items.map((item) => (
            <StagedCoverRow
              key={item.key}
              disabled={upload.isPending}
              item={item}
              onChange={(patch) => {
                if (patch.main === true) {
                  staged.updateAll((other) => ({ main: other.key === item.key }))
                } else {
                  staged.update(item.key, patch)
                }
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
        <CurrentCovers covers={media.data.covers} mediaId={mediaId} title={title} />
      )}
    </div>
  )
}
