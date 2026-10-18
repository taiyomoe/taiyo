import type { GroupPermission, MemberTarget, Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Ellipsis } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { AuthAlert } from "@/components/auth/auth-alert"
import { type Confirmation, ConfirmDialog } from "@/components/dashboard/confirm-dialog"
import { ListCard, ListRow } from "@/components/dashboard/dashboard-page"
import { PersonAvatar } from "@/components/groups/group-avatar"
import {
  MemberPermissions,
  PermissionChecklist,
  RoleBadge,
} from "@/components/groups/group-permissions"
import { getErrorMessage } from "@/lib/errors"
import {
  type Group,
  type GroupMember,
  groupMembersQueryOptions,
  useLeaveGroup,
  useMemberAction,
  useUpdateMemberPermissions,
} from "@/lib/queries/groups"
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
const toggled = (permissions: readonly GroupPermission[], permission: GroupPermission) =>
  permissions.includes(permission)
    ? permissions.filter((item) => item !== permission)
    : [...permissions, permission]

type GroupMembersPanelProps = {
  group: Group
  userId: string
  can: Permissions
}

export function GroupMembersPanel({ group, userId, can }: GroupMembersPanelProps) {
  const { data: members } = useSuspenseQuery(groupMembersQueryOptions(group.id))
  const action = useMemberAction(group.id)
  const leave = useLeaveGroup(group.id)
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [editing, setEditing] = useState<GroupMember | null>(null)
  const owners = members.filter((member) => member.role === "OWNER").length
  const failure = action.error ?? leave.error
  const confirmError = failure === null ? null : getErrorMessage(failure)

  return (
    <>
      <ListCard>
        {members.map((member) => {
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
            canEdit
              ? {
                  key: "edit",
                  label: m.member_edit_permissions(),
                  onClick: () => {
                    setEditing(member)
                  },
                }
              : null,
            canPromote
              ? {
                  key: "promote",
                  label: m.member_promote(),
                  onClick: () => {
                    setConfirmation({
                      title: m.member_promote_title({ name: member.displayUsername }),
                      description: m.member_promote_description(),
                      confirmLabel: m.member_promote(),
                      run: () => action.mutateAsync({ userId: member.userId, action: "promote" }),
                    })
                  },
                }
              : null,
            canStepDown && !isLastOwner
              ? {
                  key: "demote",
                  label: m.member_step_down(),
                  onClick: () => {
                    setConfirmation({
                      title: m.member_step_down_title(),
                      description: m.member_step_down_description(),
                      confirmLabel: m.member_step_down(),
                      run: () => action.mutateAsync({ userId: member.userId, action: "demote" }),
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
                    setConfirmation({
                      title: m.member_leave_title({ name: group.name }),
                      description: m.member_leave_description(),
                      confirmLabel: m.member_leave(),
                      destructive: true,
                      run: async () => {
                        await leave.mutateAsync()
                        await navigate({ to: "/dashboard/groups" })
                      },
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
                    setConfirmation({
                      title: m.member_remove_title({ name: member.displayUsername }),
                      description: m.member_remove_description(),
                      confirmLabel: m.member_remove(),
                      destructive: true,
                      run: () => action.mutateAsync({ userId: member.userId, action: "remove" }),
                    })
                  },
                }
              : null,
          ].filter((item) => item !== null)

          return (
            <ListRow key={member.userId}>
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
                <Menu>
                  <MenuTrigger
                    render={
                      <Button
                        aria-label={m.member_actions({ name: member.displayUsername })}
                        size="icon-sm"
                        variant="ghost"
                      />
                    }
                  >
                    <Ellipsis />
                  </MenuTrigger>
                  <MenuPopup align="end">
                    <MenuGroup>
                      {items
                        .filter((item) => item.destructive !== true)
                        .map((item) => (
                          <MenuItem key={item.key} onClick={item.onClick}>
                            {item.label}
                          </MenuItem>
                        ))}
                    </MenuGroup>
                    {items.some((item) => item.destructive === true) ? (
                      <>
                        {items.some((item) => item.destructive !== true) ? <MenuSeparator /> : null}
                        <MenuGroup>
                          {items
                            .filter((item) => item.destructive === true)
                            .map((item) => (
                              <MenuItem key={item.key} onClick={item.onClick} variant="destructive">
                                {item.label}
                              </MenuItem>
                            ))}
                        </MenuGroup>
                      </>
                    ) : null}
                  </MenuPopup>
                </Menu>
              )}
            </ListRow>
          )
        })}
      </ListCard>
      <ConfirmDialog
        confirmation={confirmation}
        error={confirmError}
        onClose={() => {
          setConfirmation(null)
          action.reset()
          leave.reset()
        }}
        pending={action.isPending || leave.isPending}
      />
      <PermissionsDialog
        can={can}
        groupId={group.id}
        member={editing}
        onClose={() => {
          setEditing(null)
        }}
      />
    </>
  )
}

type PermissionsDialogProps = {
  groupId: string
  member: GroupMember | null
  can: Permissions
  onClose: () => void
}

function PermissionsDialog({ groupId, member, can, onClose }: PermissionsDialogProps) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={member !== null}
    >
      <DialogPopup>
        {member === null ? null : (
          <PermissionsForm can={can} groupId={groupId} member={member} onDone={onClose} />
        )}
      </DialogPopup>
    </Dialog>
  )
}

function PermissionsForm({
  groupId,
  member,
  can,
  onDone,
}: {
  groupId: string
  member: GroupMember
  can: Permissions
  onDone: () => void
}) {
  const update = useUpdateMemberPermissions(groupId)
  const initial = member.permissions ?? []
  const [value, setValue] = useState<GroupPermission[]>(initial)
  const target: MemberTarget = {
    groupId,
    userId: member.userId,
    role: member.role,
    permissions: initial,
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{m.member_permissions_title({ name: member.displayUsername })}</DialogTitle>
        <DialogDescription>
          {m.member_permissions_description({ name: member.displayUsername })}
        </DialogDescription>
      </DialogHeader>
      <DialogPanel>
        <AuthAlert message={update.isError ? getErrorMessage(update.error) : null} />
        <PermissionChecklist
          canToggle={(permission) =>
            can("group.updateMember", {
              member: target,
              permissions: toggled(initial, permission),
            })
          }
          onChange={setValue}
          value={value}
        />
      </DialogPanel>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
        <Button
          disabled={update.isPending}
          onClick={() => {
            update.mutate({ userId: member.userId, permissions: value }, { onSuccess: onDone })
          }}
        >
          {m.save()}
        </Button>
      </DialogFooter>
    </>
  )
}
