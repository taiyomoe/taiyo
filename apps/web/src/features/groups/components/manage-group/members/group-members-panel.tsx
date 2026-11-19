import type { Permissions } from "@taiyomoe/permissions"
import { Key, UserRemove, Users } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { CatalogColumn } from "@/features/catalog/components/shared/catalog-table"
import type { MemberDialog } from "@/features/groups/components/manage-group/members/member-dialogs"
import { BulkBar } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonMediaCell,
  SkeletonPill,
  SkeletonText,
} from "@/features/catalog/components/shared/catalog-skeletons"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import { useSelection } from "@/features/catalog/hooks/use-selection"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import { groupMembersQueryOptions, groupQueryOptions } from "@/features/groups/api/groups"
import { MemberDialogs } from "@/features/groups/components/manage-group/members/member-dialogs"
import { MemberRow } from "@/features/groups/components/manage-group/members/member-row"
import { groupTableStyles } from "@/features/groups/lib/group-table-styles"
import { getMemberAccess } from "@/features/groups/lib/member-access"
import { m } from "@/paraglide/messages"

export function GroupMembersPanel({
  groupId,
  userId,
  can,
}: {
  groupId: string
  userId: string
  can: Permissions
}) {
  const { data: group } = useQuery(groupQueryOptions(groupId))
  const { data: members } = useQuery(groupMembersQueryOptions(groupId))
  const owners = members?.filter((member) => member.role === "OWNER").length ?? 0
  const rows = (members ?? []).map((member) => ({
    member,
    access: getMemberAccess(member, { can, groupId, userId, owners }),
  }))
  const manages = can("group.manageMembers", { id: groupId })
  const showPermissions = manages || rows.some(({ member }) => member.permissions !== null)
  const selection = useSelection(
    rows.filter(({ access }) => access.edit || access.remove).map(({ member }) => member.userId),
  )
  const selected = rows.filter(({ member }) => selection.has(member.userId))
  const [dialog, setDialog] = useState<MemberDialog | null>(null)
  const bulk = (kind: "permissions" | "remove") => () => {
    setDialog({
      kind,
      members: selected
        .filter(({ access }) => (kind === "permissions" ? access.edit : access.remove))
        .map(({ member }) => member),
      bulk: true,
    })
  }
  const columns: CatalogColumn[] = [
    {
      key: "member",
      label: m.group_members_column_member(),
      skeleton: <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="avatar" />,
    },
    {
      key: "role",
      label: m.my_groups_column_role(),
      width: catalogStyles.colMedium,
      from: "3xl",
      skeleton: <SkeletonPill width="5rem" />,
    },
    ...(showPermissions
      ? [
          {
            key: "permissions",
            label: m.invitation_column_permissions(),
            width: groupTableStyles.colPermissions,
            from: "3xl" as const,
            skeleton: <SkeletonPill width="7rem" />,
          },
        ]
      : []),
    {
      key: "joined",
      label: m.my_groups_column_joined(),
      width: catalogStyles.colMedium,
      from: "4xl",
      skeleton: <SkeletonText width="5.5rem" />,
    },
    {
      key: "actions",
      label: <VisuallyHidden>{m.catalog_column_actions()}</VisuallyHidden>,
      width: catalogStyles.colActions,
      skeleton: <SkeletonActions />,
    },
  ]

  return (
    <>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            {selected.some(({ access }) => access.edit) ? (
              <Button onClick={bulk("permissions")} variant="outline">
                <Key />
                {m.invite_permissions()}
              </Button>
            ) : null}
            {selected.some(({ access }) => access.remove) ? (
              <Button onClick={bulk("remove")} variant="destructive-outline">
                <UserRemove />
                {m.member_remove()}
              </Button>
            ) : null}
          </BulkBar>
        }
        columns={columns}
        empty={
          members?.length === 0
            ? {
                icon: Users,
                title: m.group_members_empty_title(),
                description: m.group_members_empty(),
              }
            : null
        }
        footer={
          members === undefined ? null : (
            <CatalogFooter total={m.catalog_results({ count: formatNumber(members.length) })}>
              {null}
            </CatalogFooter>
          )
        }
        loading={members === undefined}
        selection={manages ? selection : undefined}
        toolbar={null}
      >
        {rows.map(({ member, access }) => (
          <MemberRow
            access={access}
            key={member.userId}
            member={member}
            onDialog={(kind) => {
              setDialog({ kind, members: [member], bulk: false })
            }}
            selection={manages ? selection : undefined}
          />
        ))}
      </CatalogTable>
      <MemberDialogs
        can={can}
        dialog={dialog}
        groupId={groupId}
        groupName={group?.name ?? ""}
        onBulkDone={selection.clear}
        onClose={() => {
          setDialog(null)
        }}
      />
    </>
  )
}
