import * as stylex from "@stylexjs/stylex"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { SettingSection } from "@/features/reader/components/sheet/setting-controls"
import { READER_SHORTCUTS } from "@/features/reader/hooks/use-reader-keyboard"
import { m } from "@/paraglide/messages"

const LABELS = {
  turn: m.reader_shortcut_turn,
  next: m.reader_shortcut_next,
  prev: m.reader_shortcut_prev,
  edges: m.reader_shortcut_edges,
  chapter: m.reader_shortcut_chapter,
  menu: m.reader_shortcut_menu,
  fullscreen: m.reader_shortcut_fullscreen,
  layout: m.reader_shortcut_layout,
  autoScroll: m.reader_shortcut_auto_scroll,
  zoom: m.reader_shortcut_zoom,
  zoomReset: m.reader_shortcut_zoom_reset,
  bookmark: m.reader_shortcut_bookmark,
} satisfies Record<(typeof READER_SHORTCUTS)[number]["action"], () => string>
const styles = stylex.create({
  list: {
    margin: 0,
    gap: "0.625rem",
    alignItems: "center",
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
  },
  row: {
    display: "contents",
  },
  keys: {
    margin: 0,
    justifySelf: "start",
  },
  action: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function ShortcutsSection() {
  return (
    <SettingSection title={m.reader_section_shortcuts()}>
      <dl sx={styles.list}>
        {READER_SHORTCUTS.map((shortcut) => (
          <div key={shortcut.keys.join("+")} sx={styles.row}>
            <dt sx={styles.keys}>
              <KbdGroup>
                {shortcut.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </KbdGroup>
            </dt>
            <dd sx={styles.action}>{LABELS[shortcut.action]()}</dd>
          </div>
        ))}
      </dl>
    </SettingSection>
  )
}
