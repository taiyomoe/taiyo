import * as stylex from "@stylexjs/stylex"
import { Check } from "@taiyomoe/ui/components/icons"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRouter } from "@tanstack/react-router"
import type { PaletteCommand } from "@/features/command-palette/lib/palette-command"
import { previewStyles } from "@/features/command-palette/components/preview/preview-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  tile: {
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundColor: colors.chip,
    boxShadow: shadows.chip,
    color: colors.foreground,
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "3rem",
    width: "3rem",
  },
  icon: {
    height: "1.375rem",
    width: "1.375rem",
  },
  path: {
    borderRadius: radius.md,
    paddingBlock: "0.375rem",
    paddingInline: "0.5rem",
    backgroundColor: colors.well,
    color: colors.foreground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    overflowWrap: "anywhere",
  },
  checked: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
  },
})

export function CommandPreview({ command }: { command: PaletteCommand }) {
  const router = useRouter()
  const { run } = command
  const Icon = command.icon
  const effect = () => {
    if (run.type === "navigate") {
      return m.palette_preview_navigate()
    }

    if (run.type === "external") {
      return m.palette_preview_external()
    }

    if (run.type === "copy") {
      return m.palette_preview_copy()
    }

    if (run.type === "page") {
      return m.palette_preview_page({ count: run.page.commands().length })
    }

    return m.palette_preview_perform()
  }
  const path = run.type === "navigate" ? router.buildLocation(run.to).href : null

  return (
    <div sx={previewStyles.root}>
      <div sx={previewStyles.header}>
        <span sx={styles.tile}>
          <Icon {...stylex.props(styles.icon)} />
        </span>
        <div sx={previewStyles.headerText}>
          <span sx={previewStyles.heading}>{command.label}</span>
          {command.hint === undefined ? null : (
            <span sx={previewStyles.subtle}>{command.hint}</span>
          )}
        </div>
      </div>
      <p sx={previewStyles.body}>{effect()}</p>
      {path === null ? null : <code sx={styles.path}>{path}</code>}
      {command.checked === true ? (
        <span sx={[previewStyles.subtle, styles.checked]}>
          <Check height={14} width={14} />
          {m.palette_preview_current()}
        </span>
      ) : null}
    </div>
  )
}
