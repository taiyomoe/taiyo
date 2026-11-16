import * as stylex from "@stylexjs/stylex"
import type { LibraryStatus } from "@/features/library/api/library"
import {
  LIBRARY_STATUS_ICONS,
  LIBRARY_STATUS_LABELS,
  libraryStatusTones,
} from "@/features/library/lib/library-statuses"

const styles = stylex.create({
  label: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    flexShrink: 0,
  },
})

export function LibraryStatusLabel({ status }: { status: LibraryStatus }) {
  const Icon = LIBRARY_STATUS_ICONS[status]

  return (
    <span sx={styles.label}>
      <Icon size={18} {...stylex.props([styles.icon, libraryStatusTones[status]])} />
      {LIBRARY_STATUS_LABELS[status]()}
    </span>
  )
}
