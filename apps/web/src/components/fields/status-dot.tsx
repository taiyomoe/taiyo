import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { OptionIcon } from "@/components/fields/option-select"

const styles = stylex.create({
  slot: {
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "1rem",
    width: "1rem",
  },
  dot: {
    borderRadius: "50%",
    height: "0.5rem",
    width: "0.5rem",
  },
  default: { backgroundColor: colors.primary },
  destructive: { backgroundColor: colors.destructive },
  error: { backgroundColor: colors.destructive },
  info: { backgroundColor: colors.info },
  outline: { backgroundColor: colors.mutedForeground },
  secondary: { backgroundColor: colors.mutedForeground },
  success: { backgroundColor: colors.success },
  warning: { backgroundColor: colors.warning },
})

/** A dot in the color of a status badge, sized like an icon. */
function StatusDot({ variant }: { variant: BadgeVariant }) {
  return (
    <span aria-hidden sx={styles.slot}>
      <span sx={[styles.dot, styles[variant]]} />
    </span>
  )
}

/** The dot of a status, usable wherever an option icon is expected. */
export const statusDotIcon = (variant: BadgeVariant): OptionIcon =>
  function StatusDotIcon() {
    return <StatusDot variant={variant} />
  }
