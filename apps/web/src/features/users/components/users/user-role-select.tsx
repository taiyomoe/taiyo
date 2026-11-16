import type { Role } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ManagedUser } from "@/features/users/api/users"
import { OptionLabel, OptionSelect } from "@/components/fields/option-select"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"
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
        <OptionSelect
          disabled={setRole.isPending}
          label={m.users_role()}
          onChange={(role) => {
            if (role !== user.role) {
              setRole.mutate({ userId: user.id, role })
            }
          }}
          options={ROLE_OPTIONS}
          size="sm"
          value={user.role}
        />
      ) : (
        <Badge variant="outline">
          <OptionLabel options={ROLE_OPTIONS} value={user.role} />
        </Badge>
      )}
    </div>
  )
}
