import type { Permissions } from "@taiyomoe/permissions"
import { Banner, Trash, Edit, ExternalLink, Image, Refresh } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { TableCell, TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { ManagedMedia } from "@/features/catalog/api/catalog"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import { TimeAgo } from "@/components/time/time-ago"
import { MediaCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import {
  CONTENT_RATING_LABELS,
  MEDIA_STATUS_BADGES,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

export function MediaRow({
  media,
  can,
  restoring,
  onDelete,
  onRestore,
}: {
  media: ManagedMedia
  can: Permissions
  restoring: boolean
  onDelete: () => void
  onRestore: () => void
}) {
  const deleted = media.deletedAt !== null
  const live: RowAction[] = [
    {
      key: "view",
      label: m.catalog_view_page(),
      icon: ExternalLink,
      render: <Link params={{ mediaId: media.id }} to="/media/$mediaId" />,
    },
    {
      key: "edit",
      label: m.catalog_edit(),
      icon: Edit,
      render: <Link params={{ mediaId: media.id }} to="/media/$mediaId/edit" />,
    },
    {
      key: "covers",
      label: m.catalog_media_manage_covers(),
      icon: Image,
      render: <Link search={{ mediaId: media.id }} to="/dashboard/covers/upload" />,
    },
    {
      key: "banners",
      label: m.catalog_media_manage_banners(),
      icon: Banner,
      render: <Link search={{ mediaId: media.id }} to="/dashboard/banners/upload" />,
    },
    ...(can("media.delete")
      ? [
          {
            key: "delete",
            label: m.catalog_delete(),
            icon: Trash,
            destructive: true,
            onClick: onDelete,
          },
        ]
      : []),
  ]
  const removed: RowAction[] = can("media.restore")
    ? [
        {
          key: "restore",
          label: m.catalog_media_restore(),
          icon: Refresh,
          disabled: restoring,
          onClick: onRestore,
        },
      ]
    : []

  return (
    <TableRow>
      <TableCell>
        <MediaCell
          coverUrl={media.coverUrl}
          detail={MEDIA_TYPE_LABELS[media.type]()}
          mediaId={media.id}
          title={media.title}
        />
      </TableCell>
      <TableCell>
        <Badge variant={MEDIA_STATUS_BADGES[media.status]}>
          {MEDIA_STATUS_LABELS[media.status]()}
        </Badge>
      </TableCell>
      <TableCell sx={catalogStyles.numeric}>{formatNumber(media.chapterCount)}</TableCell>
      <TableCell>{CONTENT_RATING_LABELS[media.contentRating]()}</TableCell>
      <TableCell sx={catalogStyles.muted}>
        <TimeAgo date={media.deletedAt ?? media.createdAt} />
      </TableCell>
      <TableCell>
        <RowActions
          actions={deleted ? removed : live}
          label={m.catalog_actions({ name: media.title ?? m.media_untitled() })}
        />
      </TableCell>
    </TableRow>
  )
}
