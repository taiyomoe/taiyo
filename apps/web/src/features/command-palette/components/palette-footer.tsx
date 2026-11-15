import * as stylex from "@stylexjs/stylex"
import { ChevronDown, ChevronUp, Enter } from "@taiyomoe/ui/components/icons"
import { CommandFooter } from "@taiyomoe/ui/components/ui/command"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  footer: {
    display: { default: "none", [breakpoints.sm]: "flex" },
  },
  group: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
  },
  hint: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  key: {
    borderRadius: `calc(${radius.xxl} - 0.75rem - 1px)`,
  },
  button: {
    font: "inherit",
    padding: 0,
    borderStyle: "none",
    backgroundColor: "transparent",
    color: {
      default: "inherit",
      ":hover": colors.foreground,
    },
    cursor: "pointer",
  },
})

export function PaletteFooter({
  primary,
  hasActions,
  nested,
  onOpenActions,
}: {
  primary: string | null
  hasActions: boolean
  nested: boolean
  onOpenActions: () => void
}) {
  return (
    <CommandFooter sx={styles.footer}>
      <div sx={styles.group}>
        <div sx={styles.hint}>
          <KbdGroup sx={styles.key}>
            <Kbd>
              <ChevronUp />
            </Kbd>
            <Kbd>
              <ChevronDown />
            </Kbd>
          </KbdGroup>
          <span>{m.palette_footer_navigate()}</span>
        </div>
        {nested ? (
          <div sx={styles.hint}>
            <Kbd sx={styles.key}>Esc</Kbd>
            <span>{m.palette_footer_back()}</span>
          </div>
        ) : null}
      </div>
      <div sx={styles.group}>
        {primary === null ? null : (
          <div sx={styles.hint}>
            <span>{primary}</span>
            <Kbd sx={styles.key}>
              <Enter />
            </Kbd>
          </div>
        )}
        {hasActions ? (
          <button onClick={onOpenActions} sx={[styles.hint, styles.button]} type="button">
            <span>{m.palette_actions()}</span>
            <Kbd sx={styles.key}>Tab</Kbd>
          </button>
        ) : null}
      </div>
    </CommandFooter>
  )
}
