import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { InputGroup, InputGroupAddon } from "@taiyomoe/ui/components/ui/input-group"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { usePalette } from "@/features/command-palette/lib/palette-context"
import { useClientValue } from "@/hooks/use-client-value"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  search: {
    display: { default: "none", [breakpoints.sm]: "flex" },
    flexBasis: "22rem",
    flexGrow: "0",
    flexShrink: "1",
    minWidth: 0,
  },
  field: {
    cursor: "pointer",
    width: "100%",
  },
  trigger: {
    font: "inherit",
    borderStyle: "none",
    flex: "1",
    paddingInline: "calc(0.75rem - 1px)",
    alignItems: "center",
    backgroundColor: "transparent",
    color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
    cursor: "pointer",
    display: "flex",
    outlineStyle: "none",
    textAlign: "start",
    height: { default: "2.625rem", [breakpoints.sm]: "2.375rem" },
    minWidth: 0,
    "::after": {
      inset: 0,
      content: '""',
      position: "absolute",
    },
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  shortcutAddon: {
    paddingRight: "calc(0.5625rem - 1px)",
  },
  shortcut: {
    borderRadius: `calc(${radius.xl} - 0.5625rem)`,
  },
  mobile: {
    display: { default: "inline-flex", [breakpoints.sm]: "none" },
  },
})

export function AppNavbarSearch() {
  const { openPalette } = usePalette()
  const mac = useClientValue(() => /Mac|iPhone|iPad/.test(navigator.platform))

  return (
    <>
      <div role="search" sx={styles.search}>
        <InputGroup sx={styles.field}>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <button
            aria-haspopup="dialog"
            aria-label={m.shell_search_label()}
            onClick={() => {
              openPalette()
            }}
            onKeyDown={(event) => {
              if (
                event.key.length === 1 &&
                event.key !== " " &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.altKey
              ) {
                event.preventDefault()
                openPalette(event.key)
              }
            }}
            sx={styles.trigger}
            type="button"
          >
            <span sx={styles.label}>{m.shell_search_placeholder()}</span>
          </button>
          {mac === null ? null : (
            <InputGroupAddon align="inline-end" sx={styles.shortcutAddon}>
              <KbdGroup sx={styles.shortcut}>
                <Kbd>{mac ? "⌘" : "Ctrl"}</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
      <Button
        aria-label={m.shell_search_label()}
        onClick={() => {
          openPalette()
        }}
        size="icon-xl"
        sx={styles.mobile}
        variant="ghost"
      >
        <Search />
      </Button>
    </>
  )
}
