import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  badge: {
    borderRadius: radius.lg,
    paddingInline: "0.375rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
    color: colors.mutedForeground,
    display: "inline-flex",
    fontSize: "0.625rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    lineHeight: "1rem",
    textTransform: "uppercase",
    userSelect: "none",
    height: "1.25rem",
  },
})

export const SoonBadge = ({ sx }: { sx?: Sx }) => (
  <span sx={[styles.badge, sx]}>{m.shell_nav_soon()}</span>
)
