import type { GroupMembershipRole, GroupPermission } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Key } from "@taiyomoe/ui/components/icons"
import { Pill } from "@/components/badges/pill"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { GROUP_PERMISSION_LABELS } from "@/features/groups/lib/group-permission-labels"
import { m } from "@/paraglide/messages"

/**
 * What a member may do in a group: the first permission as a pill and the others counted in
 * one more pill, or, `compact`, a single pill counting them all. Every pill names the
 * permissions on hover. Owners may do everything.
 */
export function PermissionPills({
  role = "MEMBER",
  permissions,
  compact = false,
}: {
  role?: GroupMembershipRole
  permissions: readonly GroupPermission[]
  /** For the folded details of narrow tables, where long labels would be cut. */
  compact?: boolean
}) {
  if (role === "OWNER" || permissions.length === 0) {
    return (
      <span {...stylex.props(catalogStyles.muted)}>
        {role === "OWNER" ? m.my_groups_all_permissions() : m.my_groups_no_permissions()}
      </span>
    )
  }

  const labels = permissions.map((permission) => GROUP_PERMISSION_LABELS[permission].label())
  const [first, ...rest] = labels

  if (compact) {
    return (
      <Pill icon={Key} title={labels.join(", ")}>
        {m.group_permissions_count({ count: labels.length })}
      </Pill>
    )
  }

  return (
    <>
      <Pill title={first}>{first}</Pill>
      {rest.length === 0 ? null : (
        <Pill title={rest.join(", ")}>{m.group_more_count({ count: rest.length })}</Pill>
      )}
    </>
  )
}
