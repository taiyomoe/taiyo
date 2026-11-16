import type { StaffRole } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import type { MediaEditStaff } from "@/features/media-suggestions/lib/media-edit-model"
import { OptionSelect } from "@/components/fields/option-select"
import { STAFF_ROLE_OPTIONS } from "@/features/media/lib/media-options"
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

export function StaffRow({
  staff,
  onRoleChange,
  onRemove,
}: {
  staff: MediaEditStaff
  onRoleChange: (role: StaffRole) => void
  onRemove: () => void
}) {
  return (
    <div sx={styles.staffRow}>
      <span sx={styles.staffName}>{staff.name}</span>
      <OptionSelect
        label={m.media_edit_staff_role()}
        onChange={onRoleChange}
        options={STAFF_ROLE_OPTIONS}
        value={staff.role}
      />
      <Button aria-label={m.media_edit_remove()} onClick={onRemove} size="icon-xl" variant="ghost">
        <Close />
      </Button>
    </div>
  )
}
