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
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ManagedUser } from "@/features/users/api/users"
import { RoleOption } from "@/features/users/components/users/role-option"
import { ROLE_ICONS, ROLE_LABELS } from "@/features/users/lib/role-labels"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  role: {
    display: "flex",
    justifyContent: { default: "flex-start", [breakpoints.sm]: "flex-end" },
    width: { default: "100%", [breakpoints.sm]: "13rem" },
  },
})

export function UserRoleSelect({ user, editable }: { user: ManagedUser; editable: boolean }) {
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
            <SelectValue>
              {() => <RoleOption icon={ROLE_ICONS[user.role]} label={ROLE_LABELS[user.role]()} />}
            </SelectValue>
          </SelectTrigger>
          <SelectPopup>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                <RoleOption icon={ROLE_ICONS[role]} label={ROLE_LABELS[role]()} />
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
