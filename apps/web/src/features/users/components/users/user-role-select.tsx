import * as stylex from "@stylexjs/stylex"
import { ROLES, type Role } from "@taiyomoe/permissions"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ManagedUser } from "@/features/users/api/users"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  role: {
    display: "flex",
    justifyContent: "flex-end",
    width: "11rem",
  },
})

type UserRoleSelectProps = {
  user: ManagedUser
  editable: boolean
}

export function UserRoleSelect({ user, editable }: UserRoleSelectProps) {
  const queryClient = useQueryClient()
  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) =>
      ensureSuccess(await api.users[":id"].role.$patch({ param: { id: userId }, json: { role } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })

  return (
    <div sx={styles.role}>
      {editable ? (
        <Select
          disabled={setRole.isPending}
          onValueChange={(role) => {
            if (role !== null && role !== user.role) {
              setRole.mutate({ userId: user.id, role })
            }
          }}
          value={user.role}
        >
          <SelectTrigger aria-label={m.users_role()} size="sm">
            <SelectValue>{() => ROLE_LABELS[user.role]()}</SelectValue>
          </SelectTrigger>
          <SelectPopup>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]()}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      ) : (
        <Badge variant="outline">{ROLE_LABELS[user.role]()}</Badge>
      )}
    </div>
  )
}
