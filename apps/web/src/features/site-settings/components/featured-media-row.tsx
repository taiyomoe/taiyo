import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import * as stylex from "@stylexjs/stylex"
import {
  Banner,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GripVertical,
  Trash,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { FeaturedMedia } from "@/features/site-settings/api/featured-medias"
import { Pill } from "@/components/badges/pill"
import { OptionLabel, OptionValueIcon } from "@/components/fields/option-select"
import { CatalogCell } from "@/features/catalog/components/shared/catalog-table"
import { ImageThumb } from "@/features/catalog/components/shared/image-thumb"
import { MediaCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { getBannerFileName } from "@/features/media/lib/media-images"
import { MEDIA_TYPE_LABELS } from "@/features/media/lib/media-labels"
import { CONTENT_RATING_OPTIONS } from "@/features/media/lib/media-options"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    position: "relative",
  },
  dragging: {
    opacity: 0.55,
    zIndex: 1,
  },
  moving: (transform: string, transition: string) => ({
    transition,
    transform,
  }),
  handle: {
    color: colors.mutedForeground,
    cursor: { default: "grab", ":active": "grabbing" },
    touchAction: "none",
  },
  position: {
    color: colors.mutedForeground,
  },
})

export function FeaturedMediaRow({
  media,
  index,
  count,
  disabled,
  onMove,
  onRemove,
}: {
  media: FeaturedMedia
  index: number
  count: number
  disabled: boolean
  onMove: (to: number) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: media.id,
    disabled,
  })
  const title = media.title ?? m.media_untitled()
  const banner =
    media.bannerUrl === null ? (
      <Pill title={m.site_settings_no_banner_hint()} variant="warning">
        {m.site_settings_no_banner()}
      </Pill>
    ) : (
      <ImageThumb
        item={{
          id: media.id,
          url: media.bannerUrl,
          title,
          fileName: getBannerFileName(title, { url: media.bannerUrl }),
        }}
        kind="banner"
        label={m.catalog_open_image()}
      />
    )

  return (
    <TableRow
      ref={setNodeRef}
      sx={[
        styles.row,
        isDragging && styles.dragging,
        transform === null
          ? null
          : styles.moving(CSS.Transform.toString(transform) ?? "", transition ?? ""),
      ]}
    >
      <CatalogCell column="drag">
        <Button
          aria-label={m.site_settings_drag({ title })}
          disabled={disabled}
          size="icon-sm"
          sx={styles.handle}
          variant="ghost"
          {...attributes}
          {...listeners}
        >
          <GripVertical />
        </Button>
      </CatalogCell>
      <CatalogCell column="position" sx={[catalogStyles.numeric, styles.position]}>
        {index + 1}
      </CatalogCell>
      <CatalogCell column="media">
        <MediaCell
          coverUrl={media.coverUrl}
          detail={MEDIA_TYPE_LABELS[media.type]()}
          mediaId={media.id}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  {banner}
                  {media.deletedAt === null ? null : (
                    <Pill variant="error">{m.site_settings_deleted()}</Pill>
                  )}
                </Folded>
                <OptionValueIcon options={CONTENT_RATING_OPTIONS} value={media.contentRating} />
              </>
            ),
          }}
          title={media.title}
        />
      </CatalogCell>
      <CatalogCell column="banner">
        <div {...stylex.props(catalogStyles.stack)}>
          {banner}
          {media.deletedAt === null ? null : (
            <Pill variant="error">{m.site_settings_deleted()}</Pill>
          )}
        </div>
      </CatalogCell>
      <CatalogCell column="rating">
        <OptionLabel options={CONTENT_RATING_OPTIONS} value={media.contentRating} />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions
          actions={[
            {
              key: "up",
              label: m.site_settings_move_up(),
              icon: ChevronUp,
              disabled: disabled || index === 0,
              onClick: () => {
                onMove(index - 1)
              },
            },
            {
              key: "down",
              label: m.site_settings_move_down(),
              icon: ChevronDown,
              disabled: disabled || index === count - 1,
              onClick: () => {
                onMove(index + 1)
              },
            },
            {
              key: "view",
              label: m.catalog_view_page(),
              icon: ExternalLink,
              render: <Link params={{ mediaId: media.id }} to="/media/$mediaId" />,
            },
            {
              key: "banners",
              label: m.catalog_media_manage_banners(),
              icon: Banner,
              render: <Link search={{ mediaId: media.id }} to="/dashboard/banners/upload" />,
            },
            {
              key: "remove",
              label: m.site_settings_remove(),
              icon: Trash,
              destructive: true,
              disabled,
              onClick: onRemove,
            },
          ]}
          label={m.catalog_actions({ name: title })}
        />
      </CatalogCell>
    </TableRow>
  )
}
