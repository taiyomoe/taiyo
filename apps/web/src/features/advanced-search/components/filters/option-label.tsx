import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { FilterOptionIcon } from "@/features/advanced-search/lib/filter-options"

const styles = stylex.create({
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    alignItems: "center",
    color: colors.mutedForeground,
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    width: "1.125rem",
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})

export function OptionLabel({
  icon: Icon,
  children,
}: {
  icon: FilterOptionIcon | undefined
  children: ReactNode
}) {
  return (
    <span sx={styles.option}>
      {Icon === undefined ? null : (
        <span sx={styles.icon}>
          <Icon size={16} />
        </span>
      )}
      <span sx={styles.label}>{children}</span>
    </span>
  )
}
