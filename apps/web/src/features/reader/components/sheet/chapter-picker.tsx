import * as stylex from "@stylexjs/stylex"
import { ChevronLeft, ChevronRight, Globe } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReaderChapter } from "@/features/reader/api/reader"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
  },
  input: {
    flexGrow: 1,
    minWidth: 0,
  },
  option: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  optionLabel: {
    overflow: "hidden",
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  optionIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
})
const describe = (chapter: ReaderChapter) =>
  chapter.title === null
    ? getChapterLabel(chapter)
    : `${getChapterLabel(chapter)} – ${chapter.title}`

export function ChapterPicker({
  current,
  choices,
  prev,
  next,
  onSelect,
}: {
  current: ReaderChapter
  choices: readonly ReaderChapter[]
  prev: ReaderChapter | null
  next: ReaderChapter | null
  onSelect: (chapter: ReaderChapter) => void
}) {
  return (
    <div sx={styles.row}>
      <Button
        aria-label={m.reader_prev_chapter()}
        disabled={prev === null}
        onClick={() => {
          if (prev !== null) {
            onSelect(prev)
          }
        }}
        size="icon-xl"
        title={m.reader_prev_chapter()}
        variant="outline"
      >
        <ChevronLeft />
      </Button>
      <Combobox<ReaderChapter>
        isItemEqualToValue={(a, b) => a.id === b.id}
        itemToStringLabel={describe}
        items={choices}
        onValueChange={(chapter) => {
          if (chapter !== null && chapter.id !== current.id) {
            onSelect(chapter)
          }
        }}
        value={choices.find((choice) => choice.number === current.number) ?? current}
      >
        <ComboboxInput
          aria-label={m.reader_chapter()}
          placeholder={m.reader_chapter_search()}
          sx={styles.input}
        />
        <ComboboxPopup>
          <ComboboxList>
            {(chapter: ReaderChapter) => (
              <ComboboxItem key={chapter.id} value={chapter}>
                <span sx={styles.option}>
                  <span sx={styles.optionLabel}>{describe(chapter)}</span>
                  {chapter.isExternal ? (
                    <span title={m.reader_chapter_external()}>
                      <Globe size={14} {...stylex.props(styles.optionIcon)} />
                    </span>
                  ) : null}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>{m.reader_chapter_empty()}</ComboboxEmpty>
        </ComboboxPopup>
      </Combobox>
      <Button
        aria-label={m.reader_next_chapter()}
        disabled={next === null}
        onClick={() => {
          if (next !== null) {
            onSelect(next)
          }
        }}
        size="icon-xl"
        title={m.reader_next_chapter()}
        variant="outline"
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
