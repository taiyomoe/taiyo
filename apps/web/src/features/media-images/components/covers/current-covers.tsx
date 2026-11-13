import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useState } from "react"
import type { MediaCover } from "@/features/media/lib/media-images"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"
import { useDeleteCover, useSetMainCover } from "@/features/media-images/api/media-images"
import { CoverCard } from "@/features/media-images/components/covers/cover-card"
import { EditCoverDialog } from "@/features/media-images/components/covers/edit-cover-dialog"
import { ManagedGrid } from "@/features/media-images/components/shared/managed-grid"
import { ImageLightbox } from "@/features/media/components/image-lightbox/image-lightbox"
import { LanguageSelect } from "@/features/media/components/media-chapters/language-select"
import { useImageDownload } from "@/features/media/hooks/use-image-download"
import {
  getCoverFileName,
  getCoverLabel,
  getCoverLanguages,
  sortCovers,
} from "@/features/media/lib/media-images"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function CurrentCovers({
  mediaId,
  title,
  covers,
}: {
  mediaId: string
  title: string
  covers: readonly MediaCover[]
}) {
  const [language, setLanguage] = useState<string | undefined>()
  const [openId, setOpenId] = useState<string | null>(null)
  const [editing, setEditing] = useState<MediaCover | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const setMain = useSetMainCover(mediaId)
  const remove = useDeleteCover(mediaId)
  const { download } = useImageDownload()
  const languages = getCoverLanguages(covers)
  const shown = sortCovers(
    language === undefined ? covers : covers.filter((cover) => cover.language === language),
  )
  const openIndex = shown.findIndex((cover) => cover.id === openId)

  return (
    <>
      <ManagedGrid
        actions={
          languages.length > 1 ? (
            <LanguageSelect languages={languages} onChange={setLanguage} value={language} />
          ) : undefined
        }
        count={shown.length}
        kind="cover"
        title={m.media_covers_current()}
      >
        {shown.map((cover) => (
          <li key={cover.id}>
            <CoverCard
              alt={title}
              cover={cover}
              onDelete={() => {
                setConfirmation({
                  title: m.media_covers_delete_title(),
                  description: m.media_covers_delete_description(),
                  confirmLabel: m.media_images_delete(),
                  destructive: true,
                  run: () => remove.mutateAsync(cover.id),
                })
              }}
              onDownload={() => {
                void download(cover.url, getCoverFileName(title, cover))
              }}
              onEdit={() => {
                setEditing(cover)
              }}
              onOpen={() => {
                setOpenId(cover.id)
              }}
              onSetMain={() => {
                setMain.mutate(cover.id, {
                  onSuccess: () => {
                    toastManager.add({ title: m.media_covers_main_updated(), type: "success" })
                  },
                  onError: (error) => {
                    toastManager.add({ title: getErrorMessage(error), type: "error" })
                  },
                })
              }}
              pending={
                (setMain.isPending && setMain.variables === cover.id) ||
                (remove.isPending && remove.variables === cover.id)
              }
            />
          </li>
        ))}
      </ManagedGrid>
      <ImageLightbox
        index={openIndex === -1 ? null : openIndex}
        items={shown.map((cover) => ({
          id: cover.id,
          url: cover.url,
          title: `${title} — ${getCoverLabel(cover)}`,
          detail: (
            <>
              <LanguageFlag language={cover.language} />
              {getLanguageName(cover.language)}
            </>
          ),
          fileName: getCoverFileName(title, cover),
        }))}
        onClose={() => {
          setOpenId(null)
        }}
        onIndexChange={(index) => {
          setOpenId(shown[index]?.id ?? null)
        }}
      />
      <EditCoverDialog
        cover={editing}
        mediaId={mediaId}
        onClose={() => {
          setEditing(null)
        }}
      />
      <ConfirmDialog
        confirmation={confirmation}
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          setConfirmation(null)
          remove.reset()
        }}
        pending={remove.isPending}
      />
    </>
  )
}
