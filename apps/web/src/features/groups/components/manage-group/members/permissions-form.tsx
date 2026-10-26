import type { GroupPermission, MemberTarget, Permissions } from "@taiyomoe/permissions"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { GroupMember } from "@/features/groups/api/groups"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { PermissionChecklist } from "@/features/groups/components/permission-checklist"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

type PermissionsFormProps = {
  groupId: string
  member: GroupMember
  can: Permissions
  onDone: () => void
}

export function PermissionsForm({ groupId, member, can, onDone }: PermissionsFormProps) {
  const queryClient = useQueryClient()
  const update = useMutation({
    mutationFn: async ({
      userId,
      permissions,
    }: {
      userId: string
      permissions: GroupPermission[]
    }) =>
      ensureSuccess(
        await api.groups[":id"].members[":userId"].$patch({
          param: { id: groupId, userId },
          json: { permissions },
        }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["groups", groupId] }),
        queryClient.invalidateQueries({ queryKey: ["me", "groups"] }),
      ]),
  })
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
        <ErrorAlert message={update.isError ? getErrorMessage(update.error) : null} />
        <PermissionChecklist
          canToggle={(permission) =>
            can("group.updateMember", {
              member: target,
              permissions: initial.includes(permission)
                ? initial.filter((item) => item !== permission)
                : [...initial, permission],
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
