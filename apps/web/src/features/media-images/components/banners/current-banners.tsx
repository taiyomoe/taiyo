import { useState } from "react"
import type { MediaBanner } from "@/features/media/lib/media-images"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { useDeleteBanner } from "@/features/media-images/api/media-images"
import { BannerCard } from "@/features/media-images/components/banners/banner-card"
import { EditBannerDialog } from "@/features/media-images/components/banners/edit-banner-dialog"
import { ManagedGrid } from "@/features/media-images/components/shared/managed-grid"
import { ImageLightbox } from "@/features/media/components/image-lightbox/image-lightbox"
import { useImageDownload } from "@/features/media/hooks/use-image-download"
import { getBannerFileName } from "@/features/media/lib/media-images"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function CurrentBanners({
  mediaId,
  title,
  banners,
}: {
  mediaId: string
  title: string
  banners: readonly MediaBanner[]
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [editing, setEditing] = useState<MediaBanner | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const remove = useDeleteBanner(mediaId)
  const { download } = useImageDownload()

  return (
    <>
      <ManagedGrid count={banners.length} kind="banner" title={m.media_banners_current()}>
        {banners.map((banner, index) => (
          <li key={banner.id}>
            <BannerCard
              alt={title}
              banner={banner}
              label={m.media_banners_label({ number: index + 1 })}
              onDelete={() => {
                setConfirmation({
                  title: m.media_banners_delete_title(),
                  description: m.media_banners_delete_description(),
                  confirmLabel: m.media_images_delete(),
                  destructive: true,
                  run: () => remove.mutateAsync(banner.id),
                })
              }}
              onDownload={() => {
                void download(banner.url, getBannerFileName(title, banner, index))
              }}
              onEdit={() => {
                setEditing(banner)
              }}
              onOpen={() => {
                setOpenIndex(index)
              }}
              pending={remove.isPending && remove.variables === banner.id}
            />
          </li>
        ))}
      </ManagedGrid>
      <ImageLightbox
        index={openIndex}
        items={banners.map((banner, index) => ({
          id: banner.id,
          url: banner.url,
          title: `${title} — ${m.media_banners_label({ number: index + 1 })}`,
          fileName: getBannerFileName(title, banner, index),
        }))}
        onClose={() => {
          setOpenIndex(null)
        }}
        onIndexChange={setOpenIndex}
      />
      <EditBannerDialog
        banner={editing}
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
