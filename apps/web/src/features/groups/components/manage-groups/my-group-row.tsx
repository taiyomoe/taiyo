import * as stylex from "@stylexjs/stylex"
import { ExternalLink, Settings } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { MyGroup } from "@/features/groups/api/groups"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { PermissionPills } from "@/features/groups/components/permission-pills"
import { RoleBadge } from "@/features/groups/components/role-badge"
import { m } from "@/paraglide/messages"

export function MyGroupRow({
  membership: { group, role, permissions, memberCount, joinedAt },
}: {
  membership: MyGroup
}) {
  const pills = <PermissionPills permissions={permissions} role={role} />
  const actions: RowAction[] = [
    {
      key: "manage",
      label: m.my_groups_manage(),
      icon: Settings,
      render: <Link params={{ groupId: group.id }} to="/dashboard/groups/$groupId" />,
    },
    {
      key: "view",
      label: m.all_groups_view_page(),
      icon: ExternalLink,
      render: <Link params={{ groupId: group.id }} to="/groups/$groupId" />,
    },
  ]

  return (
    <TableRow>
      <CatalogCell column="group">
        <TitleCell
          detail={
            memberCount === 1 ? m.my_groups_member() : m.my_groups_members({ count: memberCount })
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <RoleBadge role={role} />
                  <PermissionPills compact permissions={permissions} role={role} />
                </Folded>
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={joinedAt} length="long" />
                </span>
              </>
            ),
          }}
          thumb={<GroupAvatar id={group.id} name={group.name} sx={mediaCellStyles.avatar} />}
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
      <CatalogCell column="role">
        <RoleBadge role={role} />
      </CatalogCell>
      <CatalogCell column="permissions">
        <div {...stylex.props(catalogStyles.inline)}>{pills}</div>
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={joinedAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: group.name })} />
      </CatalogCell>
    </TableRow>
  )
}
