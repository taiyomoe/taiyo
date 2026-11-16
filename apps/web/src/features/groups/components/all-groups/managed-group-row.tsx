import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { ExternalLink, ListNumbered, Settings, Trash, Users } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { ManagedGroup } from "@/features/groups/api/groups"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { formatNumber } from "@/features/dashboard/lib/format"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

export function ManagedGroupRow({
  group,
  can,
  selection,
  onDelete,
}: {
  group: ManagedGroup
  can: Permissions
  selection: Selection | undefined
  onDelete: () => void
}) {
  const owner =
    group.owner === null ? (
      <Pill variant="warning">{m.all_groups_unowned()}</Pill>
    ) : (
      <Uploader uploader={group.owner} />
    )
  const counts = (
    <>
      <span
        {...stylex.props(catalogStyles.inline, catalogStyles.muted)}
        title={m.all_groups_column_members()}
      >
        <Users size={14} />
        {formatNumber(group.memberCount)}
      </span>
      <span
        {...stylex.props(catalogStyles.inline, catalogStyles.muted)}
        title={m.catalog_column_chapters()}
      >
        <ListNumbered size={14} />
        {formatNumber(group.chapterCount)}
      </span>
    </>
  )
  const actions: RowAction[] = [
    {
      key: "view",
      label: m.all_groups_view_page(),
      icon: ExternalLink,
      render: <Link params={{ groupId: group.id }} to="/groups/$groupId" />,
    },
    ...(can("group.update", { id: group.id })
      ? [
          {
            key: "manage",
            label: m.all_groups_manage(),
            icon: Settings,
            render: <Link params={{ groupId: group.id }} to="/dashboard/groups/$groupId" />,
          },
        ]
      : []),
    ...(can("group.delete")
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

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell id={group.id} label={group.name} selection={selection} />
      )}
      <CatalogCell column="group">
        <TitleCell
          detail={m.all_groups_followers({ count: formatNumber(group.followerCount) })}
          narrow={{
            from: "3xl",
            content: (
              <>
                {group.owner === null ? owner : null}
                {counts}
              </>
            ),
          }}
          thumb={
            <GroupAvatar
              id={group.id}
              logoUrl={group.logoUrl}
              name={group.name}
              sx={mediaCellStyles.avatar}
            />
          }
          title={
            <Link
              params={{ groupId: group.id }}
              title={group.name}
              to="/groups/$groupId"
              {...stylex.props(mediaCellStyles.title)}
            >
              {group.name}
            </Link>
          }
        />
      </CatalogCell>
      <CatalogCell column="owner">{owner}</CatalogCell>
      <CatalogCell column="members" sx={catalogStyles.numeric}>
        {formatNumber(group.memberCount)}
      </CatalogCell>
      <CatalogCell column="chapters" sx={catalogStyles.numeric}>
        {formatNumber(group.chapterCount)}
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={group.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: group.name })} />
      </CatalogCell>
    </TableRow>
  )
}
