import { Badge } from "@taiyomoe/ui/components/ui/badge"
import type { ManagedUser } from "@/features/users/api/users"
import { OptionLabel, OptionSelect } from "@/components/fields/option-select"
import { useSetUserRole } from "@/features/users/api/users"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"

/** The user's role, as a select for whoever may change it and as a badge for anyone else. */
export function UserRoleSelect({ user, editable }: { user: ManagedUser; editable: boolean }) {
  const setRole = useSetUserRole()

  if (!editable) {
    return (
      <Badge variant="outline">
        <OptionLabel options={ROLE_OPTIONS} value={user.role} />
      </Badge>
    )
  }

  return (
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
  )
}
