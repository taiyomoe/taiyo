import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Edit, ExternalLink, ThumbsUp, Trash } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { ManagedList } from "@/features/lists/api/managed-lists"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { Folded, mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import { formatTitleCount } from "@/features/lists/lib/list-labels"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

export function ManagedListRow({
  list,
  can,
  selection,
  onEdit,
  onDelete,
}: {
  list: ManagedList
  can: Permissions
  selection: Selection | undefined
  onEdit: () => void
  onDelete: () => void
}) {
  const target = { userId: list.owner.id, visibility: list.visibility }
  const actions: RowAction[] = [
    {
      key: "view",
      label: m.lists_manage_view(),
      icon: ExternalLink,
      render: <Link params={{ listId: list.id }} to="/lists/$listId" />,
    },
    ...(can("list.update", target)
      ? [{ key: "edit", label: m.catalog_edit(), icon: Edit, onClick: onEdit }]
      : []),
    ...(can("list.delete", target)
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
        <CatalogSelectCell id={list.id} label={list.name} selection={selection} />
      )}
      <CatalogCell column="list">
        <TitleCell
          detail={<UserLink user={list.owner} />}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <span {...stylex.props(catalogStyles.muted)}>
                    {formatTitleCount(list.itemCount)}
                  </span>
                  <span
                    {...stylex.props(catalogStyles.inline, catalogStyles.muted)}
                    title={m.lists_manage_column_upvotes()}
                  >
                    <ThumbsUp size={14} />
                    {formatNumber(list.upvoteCount)}
                  </span>
                </Folded>
                <span {...stylex.props(catalogStyles.muted)}>
                  {m.list_updated()} <TimeAgo date={list.updatedAt} length="long" />
                </span>
              </>
            ),
          }}
          thumb={<Cover src={list.coverUrl} sx={mediaCellStyles.cover} />}
          title={
            <Link
              params={{ listId: list.id }}
              title={list.name}
              to="/lists/$listId"
              {...stylex.props(mediaCellStyles.title)}
            >
              {list.name}
            </Link>
          }
        />
      </CatalogCell>
      <CatalogCell column="titles" sx={catalogStyles.numeric}>
        {formatNumber(list.itemCount)}
      </CatalogCell>
      <CatalogCell column="upvotes" sx={catalogStyles.numeric}>
        {formatNumber(list.upvoteCount)}
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={list.updatedAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: list.name })} />
      </CatalogCell>
    </TableRow>
  )
}
