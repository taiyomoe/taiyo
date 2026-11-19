import { GROUP_PERMISSIONS, type GroupPermission, type Permissions } from "@taiyomoe/permissions"
import { useState } from "react"
import { omit } from "remeda"
import type { GroupMember } from "@/features/groups/api/groups"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { useUpdateGroupMembers } from "@/features/groups/api/groups"
import { PermissionChecklist } from "@/features/groups/components/permission-checklist"
import { toastGroupsResult } from "@/features/groups/lib/group-bulk-toast"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const flip = (permissions: readonly GroupPermission[], permission: GroupPermission) =>
  permissions.includes(permission)
    ? permissions.filter((item) => item !== permission)
    : [...permissions, permission]
/** A click checks a mixed permission, unchecks a checked one, and brings an unchecked one back. */
const getNextState = (current: boolean | "mixed", start: boolean | "mixed") => {
  if (current === true) {
    return false
  }

  return current === false && start === "mixed" ? "mixed" : true
}

/**
 * Edits the permissions of one member, or of several at once: a permission only some of them
 * hold shows as a dash and stays as it is unless it is checked or unchecked.
 */
export function PermissionsDialog({
  groupId,
  members,
  can,
  onClose,
  onDone,
}: {
  groupId: string
  members: readonly GroupMember[] | null
  can: Permissions
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const update = useUpdateGroupMembers(groupId)
  const [changes, setChanges] = useState<Partial<Record<GroupPermission, boolean>>>({})
  const list = members ?? []
  const [only] = list
  const single = list.length === 1 && only !== undefined ? only : null
  const initial = (permission: GroupPermission) => {
    const holders = list.filter((member) => member.permissions?.includes(permission) === true)

    if (holders.length === 0) {
      return false
    }

    return holders.length === list.length ? true : "mixed"
  }
  const checked = (permission: GroupPermission) => changes[permission] ?? initial(permission)
  const grant = GROUP_PERMISSIONS.filter((permission) => changes[permission] === true)
  const revoke = GROUP_PERMISSIONS.filter((permission) => changes[permission] === false)
  const close = () => {
    update.reset()
    setChanges({})
    onClose()
  }

  return (
    <BulkEditDialog
      changed={grant.length + revoke.length > 0}
      description={
        single === null
          ? m.member_bulk_permissions_description()
          : m.member_permissions_description({ name: single.displayUsername })
      }
      error={update.isError ? getErrorMessage(update.error) : null}
      onClose={close}
      onSubmit={() => {
        update.mutate(
          { userIds: list.map((member) => member.userId), grant, revoke },
          {
            onSuccess: (result) => {
              toastGroupsResult(
                result,
                single === null
                  ? m.member_bulk_updated
                  : () => m.member_permissions_saved({ name: single.displayUsername }),
                {},
              )
              onDone?.()
              close()
            },
          },
        )
      }}
      open={members !== null}
      pending={update.isPending}
      submitLabel={single === null ? m.catalog_bulk_apply() : m.save()}
      title={
        single === null
          ? m.member_bulk_permissions_title({ count: list.length })
          : m.member_permissions_title({ name: single.displayUsername })
      }
    >
      <PermissionChecklist
        canToggle={(permission) =>
          list.every((member) => {
            const current = member.permissions ?? []

            return can("group.updateMember", {
              member: {
                groupId,
                userId: member.userId,
                role: member.role,
                permissions: current,
              },
              permissions: flip(current, permission),
            })
          })
        }
        checked={checked}
        onToggle={(permission) => {
          const start = initial(permission)
          const next = getNextState(checked(permission), start)

          setChanges((previous) =>
            typeof next === "boolean" && next !== start
              ? { ...previous, [permission]: next }
              : omit(previous, [permission]),
          )
        }}
      />
    </BulkEditDialog>
  )
}
