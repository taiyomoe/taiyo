import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  field: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    minHeight: "1.25rem",
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
    minWidth: 0,
  },
  clear: {
    margin: 0,
    padding: 0,
    borderRadius: radius.sm,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: {
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: "150ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
  },
})

export function FilterField({
  label,
  labelId,
  onClear,
  children,
}: {
  label: ReactNode
  labelId?: string
  onClear?: (() => void) | null
  children: ReactNode
}) {
  return (
    <div sx={styles.field}>
      <div sx={styles.header}>
        <div id={labelId} sx={styles.label}>
          {label}
        </div>
        {onClear ? (
          <button aria-describedby={labelId} onClick={onClear} sx={styles.clear} type="button">
            {m.search_filter_clear()}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  )
}
