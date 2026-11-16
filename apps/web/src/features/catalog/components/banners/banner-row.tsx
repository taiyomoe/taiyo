import { Banner, Edit, Trash } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { ManagedBanner } from "@/features/catalog/api/catalog"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import { OptionLabel, OptionValueIcon } from "@/components/fields/option-select"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { ImageThumb } from "@/features/catalog/components/shared/image-thumb"
import { MediaCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { CONTENT_RATING_OPTIONS } from "@/features/media/lib/media-options"
import { m } from "@/paraglide/messages"

export function BannerRow({
  banner,
  selection,
  onEdit,
  onDelete,
}: {
  banner: ManagedBanner
  selection: Selection | undefined
  onEdit: () => void
  onDelete: () => void
}) {
  const thumb = <ImageThumb kind="banner" label={m.catalog_open_image()} src={banner.url} />

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell
          id={banner.id}
          label={banner.media.title ?? m.media_untitled()}
          selection={selection}
        />
      )}
      <CatalogCell column="image">{thumb}</CatalogCell>
      <CatalogCell column="media">
        <MediaCell
          detail={m.catalog_banner_count({ count: banner.media.imageCount })}
          mediaId={banner.media.id}
          narrow={{
            from: "2xl",
            content: (
              <>
                {thumb}
                <OptionValueIcon options={CONTENT_RATING_OPTIONS} value={banner.contentRating} />
              </>
            ),
          }}
          title={banner.media.title}
        />
      </CatalogCell>
      <CatalogCell column="rating">
        <OptionLabel options={CONTENT_RATING_OPTIONS} value={banner.contentRating} />
      </CatalogCell>
      <CatalogCell column="uploader">
        <Uploader uploader={banner.uploader} />
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo length="long" date={banner.createdAt} />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions
          actions={[
            { key: "edit", label: m.catalog_edit(), icon: Edit, onClick: onEdit },
            {
              key: "manage",
              label: m.catalog_media_manage_banners(),
              icon: Banner,
              render: <Link search={{ mediaId: banner.media.id }} to="/dashboard/banners/upload" />,
            },
            {
              key: "delete",
              label: m.catalog_delete(),
              icon: Trash,
              destructive: true,
              onClick: onDelete,
            },
          ]}
          label={m.catalog_actions({ name: banner.media.title ?? m.media_untitled() })}
        />
      </CatalogCell>
    </TableRow>
  )
}
