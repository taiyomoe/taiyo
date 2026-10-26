import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Link } from "@tanstack/react-router"
import type { MyGroup } from "@/features/groups/api/groups"
import { ListRow } from "@/components/layout/dashboard-page"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { manageGroupsStyles } from "@/features/groups/components/manage-groups/manage-groups-styles"
import { MemberPermissions } from "@/features/groups/components/member-permissions"
import { RoleBadge } from "@/features/groups/components/role-badge"
import { m } from "@/paraglide/messages"

type MyGroupRowProps = {
  membership: MyGroup
}

export function MyGroupRow({
  membership: { group, role, permissions, memberCount },
}: MyGroupRowProps) {
  return (
    <ListRow>
      <GroupAvatar id={group.id} name={group.name} />
      <div sx={manageGroupsStyles.main}>
        <div sx={manageGroupsStyles.titleLine}>
          <Link
            params={{ groupId: group.id }}
            {...stylex.props(manageGroupsStyles.name)}
            to="/groups/$groupId"
          >
            {group.name}
          </Link>
          <RoleBadge role={role} />
        </div>
        <div sx={manageGroupsStyles.meta}>
          <span>
            {memberCount === 1 ? m.my_groups_member() : m.my_groups_members({ count: memberCount })}
          </span>
        </div>
        <MemberPermissions permissions={permissions} role={role} showOwner />
      </div>
      <div sx={manageGroupsStyles.actions}>
        <Button
          render={<Link params={{ groupId: group.id }} to="/dashboard/groups/$groupId" />}
          size="sm"
          variant="outline"
        >
          {m.my_groups_manage()}
        </Button>
      </div>
    </ListRow>
  )
}
