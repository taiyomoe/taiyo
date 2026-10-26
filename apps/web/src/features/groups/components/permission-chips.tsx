import type { GroupPermission } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { GROUP_PERMISSION_LABELS } from "@/features/groups/lib/group-permission-labels"

const styles = stylex.create({
  chips: {
    gap: "0.375rem",
    display: "flex",
    flexWrap: "wrap",
  },
})

type PermissionChipsProps = {
  permissions: readonly GroupPermission[]
}

export function PermissionChips({ permissions }: PermissionChipsProps) {
  return (
    <div sx={styles.chips}>
      {permissions.map((permission) => (
        <Badge key={permission} variant="secondary">
          {GROUP_PERMISSION_LABELS[permission].label()}
        </Badge>
      ))}
    </div>
  )
}
