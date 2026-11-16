import * as stylex from "@stylexjs/stylex"
import { Banner, Edit, Trash } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { ManagedBanner } from "@/features/catalog/api/catalog"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell } from "@/features/catalog/components/shared/catalog-table"
import { ImageThumb } from "@/features/catalog/components/shared/image-thumb"
import { MediaCell } from "@/features/catalog/components/shared/media-cell"
import { RatingIcon } from "@/features/catalog/components/shared/rating-icon"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

export function BannerRow({
  banner,
  onEdit,
  onDelete,
}: {
  banner: ManagedBanner
  onEdit: () => void
  onDelete: () => void
}) {
  const thumb = <ImageThumb kind="banner" label={m.catalog_open_image()} src={banner.url} />

  return (
    <TableRow>
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
                <RatingIcon rating={banner.contentRating} />
              </>
            ),
          }}
          title={banner.media.title}
        />
      </CatalogCell>
      <CatalogCell column="rating">
        <span {...stylex.props(catalogStyles.inline)}>
          <RatingIcon rating={banner.contentRating} />
          {CONTENT_RATING_LABELS[banner.contentRating]()}
        </span>
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
