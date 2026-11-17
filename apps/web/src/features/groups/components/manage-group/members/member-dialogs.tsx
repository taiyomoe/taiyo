import type { Permissions } from "@taiyomoe/permissions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { GroupMember } from "@/features/groups/api/groups"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { renderWithName } from "@/components/user-name/with-name"
import { useRemoveGroupMembers } from "@/features/groups/api/groups"
import { PermissionsDialog } from "@/features/groups/components/manage-group/members/permissions-dialog"
import { toastGroupsResult } from "@/features/groups/lib/group-bulk-toast"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type MemberDialogKind =
  | "permissions"
  | "promote"
  | "transfer"
  | "stepDown"
  | "leave"
  | "remove"

export type MemberDialog = {
  kind: MemberDialogKind
  members: GroupMember[]
  /** Opened from the selection, which clears once the action succeeds. */
  bulk: boolean
}

/** The dialogs the member table opens, one at a time, for one row or for the selection. */
export function MemberDialogs({
  dialog,
  groupId,
  groupName,
  can,
  onClose,
  onBulkDone,
}: {
  dialog: MemberDialog | null
  groupId: string
  groupName: string
  can: Permissions
  onClose: () => void
  onBulkDone: () => void
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const remove = useRemoveGroupMembers(groupId)
  const role = useMutation({
    mutationFn: async ({
      kind,
      userId,
    }: {
      kind: "promote" | "transfer" | "stepDown"
      userId: string
    }) => {
      const param = { id: groupId, userId }

      if (kind === "transfer") {
        return ensureSuccess(
          await api.groups[":id"].transfer.$post({
            param: { id: groupId },
            json: { toUserId: userId },
          }),
        )
      }

      return ensureSuccess(
        kind === "promote"
          ? await api.groups[":id"].members[":userId"].promote.$post({ param })
          : await api.groups[":id"].members[":userId"].demote.$post({ param }),
      )
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["groups", groupId] }),
        queryClient.invalidateQueries({ queryKey: ["me", "groups"] }),
      ]),
  })
  const leave = useMutation({
    mutationFn: async () =>
      ensureSuccess(await api.groups[":id"].leave.$post({ param: { id: groupId } })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me", "groups"] })
      await navigate({ to: "/dashboard/groups" })
    },
  })
  const members = dialog?.members ?? []
  const [member] = members
  const onDone = dialog?.bulk === true ? onBulkDone : undefined
  const confirmations: Record<
    Exclude<MemberDialogKind, "permissions">,
    (member: GroupMember) => Confirmation
  > = {
    promote: (target) => ({
      title: renderWithName(m.member_promote_title, target),
      description: m.member_promote_description(),
      confirmLabel: m.member_promote(),
      run: () => role.mutateAsync({ kind: "promote", userId: target.userId }),
    }),
    transfer: (target) => ({
      title: renderWithName(m.member_transfer_title, target),
      description: m.member_transfer_description(),
      confirmLabel: m.member_transfer(),
      run: () => role.mutateAsync({ kind: "transfer", userId: target.userId }),
    }),
    stepDown: (target) => ({
      title: m.member_step_down_title(),
      description: m.member_step_down_description(),
      confirmLabel: m.member_step_down(),
      run: () => role.mutateAsync({ kind: "stepDown", userId: target.userId }),
    }),
    leave: () => ({
      title: m.member_leave_title({ name: groupName }),
      description: m.member_leave_description(),
      confirmLabel: m.member_leave(),
      destructive: true,
      run: () => leave.mutateAsync(),
    }),
    remove: (target) => ({
      title:
        members.length === 1
          ? renderWithName(m.member_remove_title, target)
          : m.member_bulk_remove_title({ count: members.length }),
      description:
        members.length === 1 ? m.member_remove_description() : m.member_bulk_remove_description(),
      confirmLabel: m.member_remove(),
      destructive: true,
      run: () =>
        remove.mutateAsync(members.map((item) => item.userId)).then((result) => {
          toastGroupsResult(
            result,
            members.length === 1
              ? () => m.member_removed({ name: target.displayUsername })
              : m.member_bulk_removed,
            {},
          )
          onDone?.()
        }),
    }),
  }
  const failure = role.error ?? leave.error ?? remove.error

  return (
    <>
      <PermissionsDialog
        can={can}
        groupId={groupId}
        members={dialog?.kind === "permissions" ? members : null}
        onClose={onClose}
        onDone={onDone}
      />
      <ConfirmDialog
        confirmation={
          dialog === null || dialog.kind === "permissions" || member === undefined
            ? null
            : confirmations[dialog.kind](member)
        }
        error={failure === null ? null : getErrorMessage(failure)}
        onClose={() => {
          onClose()
          role.reset()
          leave.reset()
          remove.reset()
        }}
        pending={role.isPending || leave.isPending || remove.isPending}
      />
    </>
  )
}
