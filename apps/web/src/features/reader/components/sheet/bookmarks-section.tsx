import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { PageBookmark } from "@/features/reader/api/page-actions"
import { SettingSection } from "@/features/reader/components/sheet/setting-controls"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.125rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  item: {
    gap: "0.25rem",
    alignItems: "center",
    display: "flex",
  },
  open: {
    font: "inherit",
    margin: 0,
    borderRadius: radius.md,
    borderWidth: 0,
    gap: "0.125rem",
    paddingBlock: "0.5rem",
    paddingInline: "0.625rem",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${colors.foreground} 6%, transparent)`,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    outlineColor: colors.ring,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textAlign: "start",
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    minWidth: 0,
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  current: {
    color: colors.primary,
  },
  title: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function BookmarksSection({
  bookmarks,
  chapterId,
  onOpen,
  onRemove,
}: {
  bookmarks: readonly PageBookmark[]
  chapterId: string
  onOpen: (bookmark: PageBookmark) => void
  onRemove: (bookmark: PageBookmark) => void
}) {
  return (
    <SettingSection title={m.reader_section_bookmarks()}>
      {bookmarks.length === 0 ? (
        <p sx={styles.empty}>{m.reader_bookmarks_empty()}</p>
      ) : (
        <ul sx={styles.list}>
          {bookmarks.map((bookmark) => (
            <li key={`${bookmark.chapterId}:${bookmark.pageId}`} sx={styles.item}>
              <button
                onClick={() => {
                  onOpen(bookmark)
                }}
                sx={styles.open}
                type="button"
              >
                <span sx={[styles.label, bookmark.chapterId === chapterId && styles.current]}>
                  {m.reader_bookmark_label({
                    chapter: m.chapter_number({ number: bookmark.chapterNumber }),
                    page: bookmark.page,
                  })}
                </span>
                {bookmark.chapterTitle === null ? null : (
                  <span sx={styles.title}>{bookmark.chapterTitle}</span>
                )}
              </button>
              <Button
                aria-label={m.reader_bookmark_remove()}
                onClick={() => {
                  onRemove(bookmark)
                }}
                size="icon-sm"
                title={m.reader_bookmark_remove()}
                variant="ghost"
              >
                <Close />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SettingSection>
  )
}
