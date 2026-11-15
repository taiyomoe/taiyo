import * as stylex from "@stylexjs/stylex"
import { Check, ChevronRight, ExternalLink } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { PaletteCommand } from "@/features/command-palette/lib/palette-command"
import { paletteRowStyles } from "@/features/command-palette/components/palette-row-styles"

const styles = stylex.create({
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    height: "1.125rem",
    width: "1.125rem",
  },
  check: {
    color: colors.primary,
  },
  small: {
    height: "0.875rem",
    width: "0.875rem",
  },
})

export function CommandRowContent({ command }: { command: PaletteCommand }) {
  const Icon = command.icon

  return (
    <>
      <Icon {...stylex.props(styles.icon)} />
      <span sx={[paletteRowStyles.primary, paletteRowStyles.text]}>{command.label}</span>
      <span sx={paletteRowStyles.trailing}>
        {command.hint === undefined ? null : <span>{command.hint}</span>}
        {command.checked === true ? <Check {...stylex.props(styles.small, styles.check)} /> : null}
        {command.run.type === "page" ? <ChevronRight {...stylex.props(styles.small)} /> : null}
        {command.run.type === "external" ? <ExternalLink {...stylex.props(styles.small)} /> : null}
      </span>
    </>
  )
}
