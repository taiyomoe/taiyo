import * as stylex from "@stylexjs/stylex"
import { Edit, Image, Star, Trash } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { Link } from "@tanstack/react-router"
import type { ManagedCover } from "@/features/catalog/api/catalog"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell } from "@/features/catalog/components/shared/catalog-table"
import { ImageThumb } from "@/features/catalog/components/shared/image-thumb"
import { MediaCell } from "@/features/catalog/components/shared/media-cell"
import { RatingIcon } from "@/features/catalog/components/shared/rating-icon"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { useSetMainCover } from "@/features/media-images/api/media-images"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function CoverRow({
  cover,
  onEdit,
  onDelete,
}: {
  cover: ManagedCover
  onEdit: () => void
  onDelete: () => void
}) {
  const setMain = useSetMainCover(cover.media.id)
  const title = cover.media.title ?? m.media_untitled()
  const rating = (
    <span {...stylex.props(catalogStyles.inline)}>
      <RatingIcon rating={cover.contentRating} />
      {CONTENT_RATING_LABELS[cover.contentRating]()}
    </span>
  )
  const main = cover.isMainCover ? <Badge variant="info">{m.media_covers_main()}</Badge> : null

  return (
    <TableRow>
      <CatalogCell column="media">
        <MediaCell
          detail={cover.volume === null ? undefined : m.catalog_volume({ volume: cover.volume })}
          mediaId={cover.media.id}
          narrow={{
            from: "3xl",
            content: (
              <>
                <LanguageChip language={cover.language} />
                <RatingIcon rating={cover.contentRating} />
                {main}
              </>
            ),
          }}
          thumb={<ImageThumb kind="cover" label={m.catalog_open_image()} src={cover.url} />}
          title={cover.media.title}
        />
      </CatalogCell>
      <CatalogCell column="language">
        <LanguageChip language={cover.language} />
      </CatalogCell>
      <CatalogCell column="rating">
        <div {...stylex.props(catalogStyles.stack)}>
          {rating}
          {main}
        </div>
      </CatalogCell>
      <CatalogCell column="uploader">
        <Uploader uploader={cover.uploader} />
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo length="long" date={cover.createdAt} />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions
          actions={[
            { key: "edit", label: m.catalog_edit(), icon: Edit, onClick: onEdit },
            ...(cover.isMainCover
              ? []
              : [
                  {
                    key: "main",
                    label: m.catalog_cover_set_main(),
                    icon: Star,
                    disabled: setMain.isPending,
                    onClick: () => {
                      setMain.mutate(cover.id, {
                        onSuccess: () => {
                          toastManager.add({
                            title: m.media_covers_main_updated(),
                            type: "success",
                          })
                        },
                        onError: (error) => {
                          toastManager.add({ title: getErrorMessage(error), type: "error" })
                        },
                      })
                    },
                  },
                ]),
            {
              key: "manage",
              label: m.catalog_media_manage_covers(),
              icon: Image,
              render: <Link search={{ mediaId: cover.media.id }} to="/dashboard/covers/upload" />,
            },
            {
              key: "delete",
              label: m.catalog_delete(),
              icon: Trash,
              destructive: true,
              onClick: onDelete,
            },
          ]}
          label={m.catalog_actions({ name: title })}
        />
      </CatalogCell>
    </TableRow>
  )
}
