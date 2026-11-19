import * as stylex from "@stylexjs/stylex"
import {
  Crown,
  ExternalLink,
  Key,
  Logout,
  Undo,
  UserRemove,
  UserSwitch,
} from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { GroupMember } from "@/features/groups/api/groups"
import type { MemberDialogKind } from "@/features/groups/components/manage-group/members/member-dialogs"
import type { MemberAccess } from "@/features/groups/lib/member-access"
import { TimeAgo } from "@/components/time/time-ago"
import { UserLink } from "@/components/user-name/user-link"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { Folded, mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { PermissionPills } from "@/features/groups/components/permission-pills"
import { RoleBadge } from "@/features/groups/components/role-badge"
import { m } from "@/paraglide/messages"

export function MemberRow({
  member,
  access,
  selection,
  onDialog,
}: {
  member: GroupMember
  access: MemberAccess
  /** Absent when the viewer cannot manage the group's members. */
  selection: Selection | undefined
  onDialog: (kind: MemberDialogKind) => void
}) {
  const open = (kind: MemberDialogKind) => () => {
    onDialog(kind)
  }
  const role = <RoleBadge role={member.role} />
  const actions: RowAction[] = [
    {
      key: "profile",
      label: m.users_view_profile(),
      icon: ExternalLink,
      render: <Link params={{ username: member.username }} to="/users/$username" />,
    },
    ...(access.edit
      ? [
          {
            key: "permissions",
            label: m.member_edit_permissions(),
            icon: Key,
            onClick: open("permissions"),
          },
        ]
      : []),
    ...(access.promote
      ? [{ key: "promote", label: m.member_promote(), icon: Crown, onClick: open("promote") }]
      : []),
    ...(access.transfer
      ? [
          {
            key: "transfer",
            label: m.member_transfer(),
            icon: UserSwitch,
            onClick: open("transfer"),
          },
        ]
      : []),
    ...(access.stepDown
      ? [{ key: "stepDown", label: m.member_step_down(), icon: Undo, onClick: open("stepDown") }]
      : []),
    ...(access.leave
      ? [
          {
            key: "leave",
            label: m.member_leave(),
            icon: Logout,
            destructive: true,
            onClick: open("leave"),
          },
        ]
      : []),
    ...(access.remove
      ? [
          {
            key: "remove",
            label: m.member_remove(),
            icon: UserRemove,
            destructive: true,
            onClick: open("remove"),
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell
          disabled={!access.edit && !access.remove}
          id={member.userId}
          label={member.displayUsername}
          selection={selection}
        />
      )}
      <CatalogCell column="member">
        <TitleCell
          detail={access.self ? `@${member.username} · ${m.member_you()}` : `@${member.username}`}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  {role}
                  {member.permissions === null ? null : (
                    <PermissionPills compact permissions={member.permissions} role={member.role} />
                  )}
                </Folded>
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={member.createdAt} length="long" />
                </span>
              </>
            ),
          }}
          thumb={
            <PersonAvatar person={{ ...member, id: member.userId }} sx={mediaCellStyles.avatar} />
          }
          title={<UserLink sx={mediaCellStyles.title} user={member} />}
        />
      </CatalogCell>
      <CatalogCell column="role">{role}</CatalogCell>
      {member.permissions === null ? null : (
        <CatalogCell column="permissions">
          <div {...stylex.props(catalogStyles.inline)}>
            <PermissionPills permissions={member.permissions} role={member.role} />
          </div>
        </CatalogCell>
      )}
      <CatalogCell column="joined" sx={catalogStyles.muted}>
        <TimeAgo date={member.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: member.displayUsername })} />
      </CatalogCell>
    </TableRow>
  )
}
