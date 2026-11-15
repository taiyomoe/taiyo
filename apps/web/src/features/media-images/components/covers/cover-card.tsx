import * as stylex from "@stylexjs/stylex"
import { Crown, Download, Edit, Trash } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { MenuItem, MenuSeparator } from "@taiyomoe/ui/components/ui/menu"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaCover } from "@/features/media/lib/media-images"
import { LanguageChip } from "@/components/flags/flags"
import { ManagedImageCard } from "@/features/media-images/components/shared/managed-image-card"
import { getCoverLabel } from "@/features/media/lib/media-images"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  main: {
    color: colors.warning,
  },
})

export function CoverCard({
  cover,
  alt,
  pending,
  onOpen,
  onEdit,
  onSetMain,
  onDownload,
  onDelete,
}: {
  cover: MediaCover
  alt: string
  pending: boolean
  onOpen: () => void
  onEdit: () => void
  onSetMain: () => void
  onDownload: () => void
  onDelete: () => void
}) {
  return (
    <ManagedImageCard
      alt={alt}
      kind="cover"
      menu={
        <>
          <MenuItem onClick={onEdit}>
            <Edit />
            {m.media_images_edit()}
          </MenuItem>
          <MenuItem disabled={cover.isMainCover} onClick={onSetMain}>
            <Crown />
            {m.media_covers_set_main()}
          </MenuItem>
          <MenuItem onClick={onDownload}>
            <Download />
            {m.media_lightbox_download()}
          </MenuItem>
          <MenuSeparator />
          <MenuItem disabled={cover.isMainCover} onClick={onDelete} variant="destructive">
            <Trash />
            {m.media_images_delete()}
          </MenuItem>
        </>
      }
      meta={
        <>
          <LanguageChip language={cover.language} />
          {cover.contentRating === "NORMAL" ? null : (
            <Badge size="sm" variant="warning">
              {CONTENT_RATING_LABELS[cover.contentRating]()}
            </Badge>
          )}
          {cover.isMainCover ? (
            <Badge size="sm" variant="outline">
              <Crown {...stylex.props(styles.main)} />
              {m.media_covers_main()}
            </Badge>
          ) : null}
        </>
      }
      onOpen={onOpen}
      pending={pending}
      src={cover.url}
      title={getCoverLabel(cover)}
    />
  )
}
