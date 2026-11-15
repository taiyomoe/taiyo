import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { type PointerEvent, useState } from "react"

const styles = stylex.create({
  tip: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.375rem",
    paddingInline: "0.625rem",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    fontSize: "0.8125rem",
    fontWeight: 550,
    pointerEvents: "none",
    position: "fixed",
    transform: "translate(-50%, calc(-100% - 8px))",
    whiteSpace: "nowrap",
    zIndex: 50,
  },
})

type Tip = { text: string; x: number; y: number }

/**
 * One tooltip for a whole chart: marks carry their text in `data-tip`, and a
 * single delegated listener positions it, instead of a handler per mark.
 */
export function useHoverTip() {
  const [tip, setTip] = useState<Tip | null>(null)
  const show = (event: PointerEvent<HTMLElement>) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-tip]") : null
    const text = target?.getAttribute("data-tip") ?? null

    if (target === null || text === null) {
      setTip(null)

      return
    }

    const rect = target.getBoundingClientRect()

    setTip((current) =>
      current?.text === text && current.x === rect.left + rect.width / 2
        ? current
        : { text, x: rect.left + rect.width / 2, y: rect.top },
    )
  }

  return {
    handlers: {
      onPointerOver: show,
      onPointerLeave: () => {
        setTip(null)
      },
    },
    element:
      tip === null ? null : (
        <div role="tooltip" style={{ left: tip.x, top: tip.y }} sx={styles.tip}>
          {tip.text}
        </div>
      ),
  }
}
