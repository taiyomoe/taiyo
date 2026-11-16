import type { Hotkey } from "@tanstack/react-hotkeys"
import * as stylex from "@stylexjs/stylex"
import { KbdHotkey } from "@taiyomoe/ui/components/ui/kbd"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useAppHotkeyList } from "@tanstack/react-hotkeys"
import { SettingSection } from "@/features/reader/components/sheet/setting-controls"
import { m } from "@/paraglide/messages"

const LABELS: Record<string, (() => string) | undefined> = {
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
}
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
    gap: "0.25rem",
    display: "flex",
    flexWrap: "wrap",
    justifySelf: "start",
  },
  action: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function ShortcutsSection() {
  const items = useAppHotkeyList()
  const groups = new Map<string, { label: () => string; hotkeys: Hotkey[] }>()

  for (const { appHotkey } of items) {
    const group = appHotkey.meta?.group
    const label = group === undefined ? undefined : LABELS[group]

    if (!appHotkey.id.startsWith("reader.") || group === undefined || label === undefined) {
      continue
    }

    const entry = groups.get(group) ?? { label, hotkeys: [] }

    if (appHotkey.hotkey !== null) {
      entry.hotkeys.push(appHotkey.hotkey)
    }

    groups.set(group, entry)
  }

  return (
    <SettingSection title={m.reader_section_shortcuts()}>
      <dl sx={styles.list}>
        {[...groups].map(([group, { label, hotkeys }]) => (
          <div key={group} sx={styles.row}>
            <dt sx={styles.keys}>
              {hotkeys.map((hotkey) => (
                <KbdHotkey key={String(hotkey)} hotkey={hotkey} />
              ))}
            </dt>
            <dd sx={styles.action}>{label()}</dd>
          </div>
        ))}
      </dl>
    </SettingSection>
  )
}
