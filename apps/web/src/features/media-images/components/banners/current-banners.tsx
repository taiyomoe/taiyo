import { useState } from "react"
import type { DeletableBanner } from "@/features/catalog/components/banners/delete-banner-dialog"
import type { MediaBanner } from "@/features/media/lib/media-images"
import { DeleteBannerDialog } from "@/features/catalog/components/banners/delete-banner-dialog"
import { BannerCard } from "@/features/media-images/components/banners/banner-card"
import { EditBannerDialog } from "@/features/media-images/components/banners/edit-banner-dialog"
import { ManagedGrid } from "@/features/media-images/components/shared/managed-grid"
import { ImageLightbox } from "@/features/media/components/image-lightbox/image-lightbox"
import { useImageDownload } from "@/features/media/hooks/use-image-download"
import { getBannerFileName } from "@/features/media/lib/media-images"
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
  const [deleting, setDeleting] = useState<DeletableBanner | null>(null)
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
                setDeleting({
                  id: banner.id,
                  mediaId,
                  mediaTitle: title,
                  last: banners.length === 1,
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
              pending={false}
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
      <DeleteBannerDialog
        banner={deleting}
        onClose={() => {
          setDeleting(null)
        }}
      />
    </>
  )
}
