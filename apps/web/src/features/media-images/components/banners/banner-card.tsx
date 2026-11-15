import { Download, Edit, Trash } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { MenuItem, MenuSeparator } from "@taiyomoe/ui/components/ui/menu"
import type { MediaBanner } from "@/features/media/lib/media-images"
import { ManagedImageCard } from "@/features/media-images/components/shared/managed-image-card"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

export function BannerCard({
  banner,
  label,
  alt,
  pending,
  onOpen,
  onEdit,
  onDownload,
  onDelete,
}: {
  banner: MediaBanner
  label: string
  alt: string
  pending: boolean
  onOpen: () => void
  onEdit: () => void
  onDownload: () => void
  onDelete: () => void
}) {
  return (
    <ManagedImageCard
      alt={alt}
      kind="banner"
      menu={
        <>
          <MenuItem onClick={onEdit}>
            <Edit />
            {m.media_images_edit()}
          </MenuItem>
          <MenuItem onClick={onDownload}>
            <Download />
            {m.media_lightbox_download()}
          </MenuItem>
          <MenuSeparator />
          <MenuItem onClick={onDelete} variant="destructive">
            <Trash />
            {m.media_images_delete()}
          </MenuItem>
        </>
      }
      meta={
        <Badge size="sm" variant={banner.contentRating === "NORMAL" ? "outline" : "warning"}>
          {CONTENT_RATING_LABELS[banner.contentRating]()}
        </Badge>
      }
      onOpen={onOpen}
      pending={pending}
      src={banner.url}
      title={label}
    />
  )
}
