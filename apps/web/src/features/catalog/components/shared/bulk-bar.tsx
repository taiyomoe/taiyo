import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Close, Edit, Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bar: {
    padding: "0.5rem",
    borderColor: colors.border,
    borderRadius: {
      default: "calc(1.125rem + 0.5rem + 1px)",
      [breakpoints.sm]: "calc(1rem + 0.5rem + 1px)",
    },
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    alignItems: "center",
    backdropFilter: "blur(12px)",
    backgroundColor: `color-mix(in srgb, ${colors.card} 92%, transparent)`,
    boxShadow: shadows.overlay,
    display: "flex",
    flexWrap: "wrap",
    paddingInlineStart: "1rem",
    position: "sticky",
    zIndex: 10,
    bottom: "1rem",
  },
  count: {
    color: colors.mutedForeground,
    flexGrow: 1,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
})

/** Floats under the table while rows are selected, with what can be done to all of them. */
export function BulkBar({
  count,
  onClear,
  children,
}: {
  count: number
  onClear: () => void
  children: ReactNode
}) {
  if (count === 0) {
    return null
  }

  return (
    <div aria-label={m.catalog_bulk_actions()} role="toolbar" sx={styles.bar}>
      <span aria-live="polite" sx={styles.count}>
        {m.catalog_bulk_selected({ count })}
      </span>
      <div sx={styles.actions}>
        {children}
        <Button aria-label={m.catalog_bulk_clear()} onClick={onClear} size="icon" variant="ghost">
          <Close />
        </Button>
      </div>
    </div>
  )
}

export function BulkEditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="outline">
      <Edit />
      {m.catalog_edit()}
    </Button>
  )
}

export function BulkDeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="destructive-outline">
      <Trash />
      {m.catalog_delete()}
    </Button>
  )
}
