import type { MemberTarget, Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Confirmation } from "@/components/dialogs/confirm-dialog"
import type { Group, GroupMember } from "@/features/groups/api/groups"
import { ListRow } from "@/components/layout/dashboard-page"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { MemberActionsMenu } from "@/features/groups/components/manage-group/members/member-actions-menu"
import { MemberPermissions } from "@/features/groups/components/member-permissions"
import { RoleBadge } from "@/features/groups/components/role-badge"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  main: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  name: {
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  username: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

export function MemberRow({
  member,
  group,
  userId,
  owners,
  can,
  onEdit,
  onConfirm,
  onAction,
  onLeave,
}: {
  member: GroupMember
  group: Group
  userId: string
  owners: number
  can: Permissions
  onEdit: () => void
  onConfirm: (confirmation: Confirmation) => void
  onAction: (action: "remove" | "promote" | "demote") => Promise<unknown>
  onLeave: () => Promise<unknown>
}) {
  const target: MemberTarget = {
    groupId: group.id,
    userId: member.userId,
    role: member.role,
    permissions: member.permissions ?? [],
  }
  const self = member.userId === userId
  const canEdit =
    member.permissions !== null &&
    can("group.updateMember", { member: target, permissions: target.permissions })
  const canRemove = !self && can("group.removeMember", target)
  const canPromote = can("group.promoteMember", target)
  const canStepDown = self && can("group.demoteMember", target)
  const isLastOwner = member.role === "OWNER" && owners <= 1
  const items = [
    canEdit ? { key: "edit", label: m.member_edit_permissions(), onClick: onEdit } : null,
    canPromote
      ? {
          key: "promote",
          label: m.member_promote(),
          onClick: () => {
            onConfirm({
              title: m.member_promote_title({ name: member.displayUsername }),
              description: m.member_promote_description(),
              confirmLabel: m.member_promote(),
              run: () => onAction("promote"),
            })
          },
        }
      : null,
    canStepDown && !isLastOwner
      ? {
          key: "demote",
          label: m.member_step_down(),
          onClick: () => {
            onConfirm({
              title: m.member_step_down_title(),
              description: m.member_step_down_description(),
              confirmLabel: m.member_step_down(),
              run: () => onAction("demote"),
            })
          },
        }
      : null,
    self && !isLastOwner
      ? {
          key: "leave",
          label: m.member_leave(),
          destructive: true,
          onClick: () => {
            onConfirm({
              title: m.member_leave_title({ name: group.name }),
              description: m.member_leave_description(),
              confirmLabel: m.member_leave(),
              destructive: true,
              run: onLeave,
            })
          },
        }
      : null,
    canRemove
      ? {
          key: "remove",
          label: m.member_remove(),
          destructive: true,
          onClick: () => {
            onConfirm({
              title: m.member_remove_title({ name: member.displayUsername }),
              description: m.member_remove_description(),
              confirmLabel: m.member_remove(),
              destructive: true,
              run: () => onAction("remove"),
            })
          },
        }
      : null,
  ].filter((item) => item !== null)

  return (
    <ListRow>
      <PersonAvatar
        person={{
          id: member.userId,
          displayUsername: member.displayUsername,
          image: member.image,
        }}
      />
      <div sx={styles.main}>
        <div sx={styles.titleLine}>
          <span sx={styles.name}>{member.displayUsername}</span>
          <span sx={styles.username}>@{member.username}</span>
          <RoleBadge role={member.role} />
          {self ? <span sx={styles.muted}>· {m.member_you()}</span> : null}
        </div>
        <MemberPermissions permissions={member.permissions} role={member.role} />
      </div>
      {items.length === 0 ? null : (
        <MemberActionsMenu items={items} name={member.displayUsername} />
      )}
    </ListRow>
  )
}
