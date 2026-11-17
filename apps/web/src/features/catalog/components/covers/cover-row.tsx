import * as stylex from "@stylexjs/stylex"
import { Crown, Edit, Image, Star, Trash } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { Link } from "@tanstack/react-router"
import type { ManagedCover } from "@/features/catalog/api/catalog"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import { Pill } from "@/components/badges/pill"
import { OptionLabel, OptionValueIcon } from "@/components/fields/option-select"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { ImageThumb } from "@/features/catalog/components/shared/image-thumb"
import { MediaCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { useSetMainCover } from "@/features/media-images/api/media-images"
import { getCoverFileName, getCoverLabel } from "@/features/media/lib/media-images"
import { CONTENT_RATING_OPTIONS } from "@/features/media/lib/media-options"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function CoverRow({
  cover,
  selection,
  onEdit,
  onDelete,
}: {
  cover: ManagedCover
  selection: Selection | undefined
  onEdit: () => void
  onDelete: () => void
}) {
  const setMain = useSetMainCover(cover.media.id)
  const title = cover.media.title ?? m.media_untitled()
  const rating = <OptionLabel options={CONTENT_RATING_OPTIONS} value={cover.contentRating} />
  const main = cover.isMainCover ? (
    <Pill icon={Crown} title={m.media_covers_main()} variant="info">
      {m.catalog_cover_main()}
    </Pill>
  ) : null

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell id={cover.id} label={title} selection={selection} />
      )}
      <CatalogCell column="media">
        <MediaCell
          detail={cover.volume === null ? undefined : m.catalog_volume({ volume: cover.volume })}
          mediaId={cover.media.id}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <LanguageChip language={cover.language} />
                  <OptionValueIcon options={CONTENT_RATING_OPTIONS} value={cover.contentRating} />
                  {main}
                </Folded>
                <Uploader uploader={cover.uploader} />
                <span sx={catalogStyles.muted}>
                  <TimeAgo length="long" date={cover.createdAt} />
                </span>
              </>
            ),
          }}
          thumb={
            <ImageThumb
              item={{
                id: cover.id,
                url: cover.url,
                title: `${title} — ${getCoverLabel(cover)}`,
                fileName: getCoverFileName(title, cover),
              }}
              kind="cover"
              label={m.catalog_open_image()}
            />
          }
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
