import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { List } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { EditorTitle } from "@/features/lists/lib/list-editor"
import { listEditorStyles } from "@/features/lists/components/list-editor/list-editor-styles"
import { SortableTitleGrid } from "@/features/lists/components/list-editor/sortable-title-grid"
import { TitleSearch } from "@/features/lists/components/list-editor/title-search"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  count: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  hint: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

export function TitlesPanel({
  items,
  disabled,
  onChange,
}: {
  items: EditorTitle[]
  disabled: boolean
  onChange: (items: EditorTitle[]) => void
}) {
  const full = items.length >= config.lists.maxItems

  return (
    <section sx={listEditorStyles.panel}>
      <div sx={listEditorStyles.panelHeader}>
        <h2 sx={listEditorStyles.panelTitle}>{m.list_editor_titles()}</h2>
        <span sx={styles.count}>
          {m.list_editor_titles_count({ count: items.length, max: config.lists.maxItems })}
        </span>
      </div>
      {full ? (
        <p sx={styles.hint}>{m.list_editor_full()}</p>
      ) : (
        <TitleSearch
          disabled={disabled}
          onAdd={(title) => {
            onChange([...items, title])
          }}
          selectedIds={new Set(items.map((item) => item.mediaId))}
        />
      )}
      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <List />
            </EmptyMedia>
            <EmptyTitle>{m.list_editor_titles_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.list_editor_titles_empty_description()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <SortableTitleGrid disabled={disabled} items={items} onChange={onChange} />
      )}
    </section>
  )
}
