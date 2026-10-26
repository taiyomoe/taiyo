import * as stylex from "@stylexjs/stylex"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import {
  CHAPTER_SORTS,
  type ChapterSort,
  type MediaChapterFacets,
} from "@/features/chapters/api/chapters"
import { ChapterSearchField } from "@/features/media/components/media-chapters/chapter-search-field"
import { LanguageSelect } from "@/features/media/components/media-chapters/language-select"
import { m } from "@/paraglide/messages"

const MIN_LANGUAGES_FOR_FILTER = 3
const SORT_LABELS: Record<ChapterSort, () => string> = {
  newest: m.media_chapters_sort_newest,
  oldest: m.media_chapters_sort_oldest,
  uploaded: m.media_chapters_sort_uploaded,
}
const styles = stylex.create({
  toolbar: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  unread: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    userSelect: "none",
    whiteSpace: "nowrap",
  },
})

type ChaptersToolbarProps = {
  query: string | undefined
  language: string | undefined
  languages: MediaChapterFacets["languages"]
  sort: ChapterSort
  signedIn: boolean
  unread: boolean
  onSearch: (q?: string) => void
  onLanguageChange: (language: string | undefined) => void
  onSortChange: (sort: ChapterSort) => void
  onUnreadChange: (checked: boolean) => void
}

export function ChaptersToolbar({
  query,
  language,
  languages,
  sort,
  signedIn,
  unread,
  onSearch,
  onLanguageChange,
  onSortChange,
  onUnreadChange,
}: ChaptersToolbarProps) {
  return (
    <div sx={styles.toolbar}>
      <ChapterSearchField onSearch={onSearch} value={query ?? ""} />
      {languages.length >= MIN_LANGUAGES_FOR_FILTER || language !== undefined ? (
        <LanguageSelect languages={languages} onChange={onLanguageChange} value={language} />
      ) : null}
      <Tabs
        onValueChange={(value: ChapterSort) => {
          onSortChange(value)
        }}
        value={sort}
      >
        <TabsList aria-label={m.media_chapters_sort()}>
          {CHAPTER_SORTS.map((value) => (
            <TabsTab key={value} value={value}>
              {SORT_LABELS[value]()}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      {signedIn ? (
        <label sx={styles.unread}>
          <Switch
            checked={unread}
            onCheckedChange={(checked) => {
              onUnreadChange(checked)
            }}
          />
          {m.media_chapters_unread()}
        </label>
      ) : null}
    </div>
  )
}
