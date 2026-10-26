import type { Permissions } from "@taiyomoe/permissions"
import { Dialog, DialogPopup } from "@taiyomoe/ui/components/ui/dialog"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ListCard } from "@/components/layout/dashboard-page"
import {
  type Group,
  type GroupMember,
  groupMembersQueryOptions,
} from "@/features/groups/api/groups"
import { MemberRow } from "@/features/groups/components/manage-group/members/member-row"
import { PermissionsForm } from "@/features/groups/components/manage-group/members/permissions-form"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"

type GroupMembersPanelProps = {
  group: Group
  userId: string
  can: Permissions
}

export function GroupMembersPanel({ group, userId, can }: GroupMembersPanelProps) {
  const { data: members } = useSuspenseQuery(groupMembersQueryOptions(group.id))
  const queryClient = useQueryClient()
  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["groups", group.id] }),
      queryClient.invalidateQueries({ queryKey: ["me", "groups"] }),
    ])
  const action = useMutation({
    mutationFn: async ({
      userId: memberId,
      action: kind,
    }: {
      userId: string
      action: "remove" | "promote" | "demote"
    }) => {
      const param = { id: group.id, userId: memberId }

      if (kind === "remove") {
        return ensureSuccess(await api.groups[":id"].members[":userId"].$delete({ param }))
      }

      return ensureSuccess(
        kind === "promote"
          ? await api.groups[":id"].members[":userId"].promote.$post({ param })
          : await api.groups[":id"].members[":userId"].demote.$post({ param }),
      )
    },
    onSuccess: invalidate,
  })
  const leave = useMutation({
    mutationFn: async () =>
      ensureSuccess(await api.groups[":id"].leave.$post({ param: { id: group.id } })),
    onSuccess: invalidate,
  })
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [editing, setEditing] = useState<GroupMember | null>(null)
  const owners = members.filter((member) => member.role === "OWNER").length
  const failure = action.error ?? leave.error
  const confirmError = failure === null ? null : getErrorMessage(failure)

  return (
    <>
      <ListCard>
        {members.map((member) => (
          <MemberRow
            can={can}
            group={group}
            key={member.userId}
            member={member}
            onAction={(kind) => action.mutateAsync({ userId: member.userId, action: kind })}
            onConfirm={setConfirmation}
            onEdit={() => {
              setEditing(member)
            }}
            onLeave={async () => {
              await leave.mutateAsync()
              await navigate({ to: "/dashboard/groups" })
            }}
            owners={owners}
            userId={userId}
          />
        ))}
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
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null)
          }
        }}
        open={editing !== null}
      >
        <DialogPopup>
          {editing === null ? null : (
            <PermissionsForm
              can={can}
              groupId={group.id}
              member={editing}
              onDone={() => {
                setEditing(null)
              }}
            />
          )}
        </DialogPopup>
      </Dialog>
    </>
  )
}
