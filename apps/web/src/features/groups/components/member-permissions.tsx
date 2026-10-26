import type { GroupMembershipRole, GroupPermission } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { PermissionChips } from "@/features/groups/components/permission-chips"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  muted: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

type MemberPermissionsProps = {
  role: GroupMembershipRole
  permissions: readonly GroupPermission[] | null
  showOwner?: boolean
}

export function MemberPermissions({
  role,
  permissions,
  showOwner = false,
}: MemberPermissionsProps) {
  if (role === "OWNER") {
    return showOwner ? <span sx={styles.muted}>{m.my_groups_all_permissions()}</span> : null
  }

  if (permissions === null) {
    return null
  }

  if (permissions.length === 0) {
    return <span sx={styles.muted}>{m.my_groups_no_permissions()}</span>
  }

  return <PermissionChips permissions={permissions} />
}
