import type { Role } from "@taiyomoe/permissions"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useState } from "react"
import type { ManagedUser } from "@/features/users/api/users"
import { OptionSelect } from "@/components/fields/option-select"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { useSetUsersRole } from "@/features/users/api/users"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function RoleDialog({
  users,
  selfId,
  onClose,
  onDone,
}: {
  users: readonly ManagedUser[] | null
  selfId: string
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const setRole = useSetUsersRole()
  const [picked, setPicked] = useState<Role | null>(null)
  const [only] = users ?? []
  const role = picked ?? (users?.length === 1 && only !== undefined ? only.role : "USER")
  const close = () => {
    setRole.reset()
    setPicked(null)
    onClose()
  }

  return (
    <BulkEditDialog
      changed={users !== null && users.length > 0}
      description={m.users_role_dialog_description()}
      error={setRole.isError ? getErrorMessage(setRole.error) : null}
      onClose={close}
      onSubmit={() => {
        if (users !== null) {
          setRole.mutate(
            { userIds: users.map((user) => user.id), role },
            {
              onSuccess: (result) => {
                toastBulkResult(result, m.users_bulk_updated)
                onDone?.()
                close()
              },
            },
          )
        }
      }}
      open={users !== null}
      pending={setRole.isPending}
      title={
        users?.length === 1 && only !== undefined
          ? m.users_role_dialog_title_one({ name: only.displayUsername })
          : m.users_role_dialog_title({ count: users?.length ?? 0 })
      }
    >
      <Field>
        <FieldLabel>{m.users_role()}</FieldLabel>
        <OptionSelect
          label={m.users_role()}
          onChange={setPicked}
          options={ROLE_OPTIONS}
          value={role}
        />
        {users?.some((user) => user.id === selfId) === true ? (
          <FieldDescription>{m.users_role_dialog_self()}</FieldDescription>
        ) : null}
      </Field>
    </BulkEditDialog>
  )
}
