import * as stylex from "@stylexjs/stylex"
import { STAFF_ROLES, type StaffRole } from "@taiyomoe/db/constants"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import type { MediaEditStaff } from "@/features/media-suggestions/lib/media-edit-model"
import { EnumSelect } from "@/features/media-suggestions/components/field-editors/enum-select"
import { STAFF_ROLE_LABELS } from "@/features/media-suggestions/lib/media-edit-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  staffRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 10rem auto",
  },
  staffName: {
    overflow: "hidden",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

type StaffRowProps = {
  staff: MediaEditStaff
  onRoleChange: (role: StaffRole) => void
  onRemove: () => void
}

export function StaffRow({ staff, onRoleChange, onRemove }: StaffRowProps) {
  return (
    <div sx={styles.staffRow}>
      <span sx={styles.staffName}>{staff.name}</span>
      <EnumSelect
        label={m.media_edit_staff_role()}
        labels={STAFF_ROLE_LABELS}
        onChange={onRoleChange}
        options={STAFF_ROLES}
        value={staff.role}
      />
      <Button aria-label={m.media_edit_remove()} onClick={onRemove} size="icon-sm" variant="ghost">
        <Close />
      </Button>
    </div>
  )
}
