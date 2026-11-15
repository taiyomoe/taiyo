import * as stylex from "@stylexjs/stylex"
import type { StaffOption } from "@/features/advanced-search/api/staffs"
import { PersonAvatar } from "@/features/activity-log/components/avatars/person-avatar"

const styles = stylex.create({
  row: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})

export function StaffRow({ staff }: { staff: StaffOption }) {
  return (
    <span sx={styles.row}>
      <PersonAvatar image={staff.imageUrl} name={staff.name} seed={staff.id} size="1.5rem" />
      <span sx={styles.name}>{staff.name}</span>
    </span>
  )
}
