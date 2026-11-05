import * as stylex from "@stylexjs/stylex"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { ReaderChapter } from "@/features/reader/api/reader"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { ChapterPicker } from "@/features/reader/components/sheet/chapter-picker"
import { PageSelect } from "@/features/reader/components/sheet/page-select"
import { SettingField } from "@/features/reader/components/sheet/setting-controls"
import { VersionSelect } from "@/features/reader/components/sheet/version-select"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  media: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 72%, transparent)`,
    },
    fontSize: "1.0625rem",
    fontWeight: 600,
    lineHeight: 1.3,
    transitionDuration: motion.enter,
    transitionProperty: "color",
  },
  chapter: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

export function ChapterSection({
  mediaId,
  mediaTitle,
  current,
  choices,
  versions,
  prev,
  next,
  page,
  pageCount,
  onSelectChapter,
  onSelectPage,
}: {
  mediaId: string
  mediaTitle: string
  current: ReaderChapter
  choices: readonly ReaderChapter[]
  versions: readonly ReaderChapter[]
  prev: ReaderChapter | null
  next: ReaderChapter | null
  page: number
  pageCount: number
  onSelectChapter: (chapter: ReaderChapter) => void
  onSelectPage: (index: number) => void
}) {
  return (
    <section sx={styles.section}>
      <div sx={styles.heading}>
        <Link params={{ mediaId }} to="/media/$mediaId" {...stylex.props(styles.media)}>
          {mediaTitle}
        </Link>
        <p sx={styles.chapter}>
          {current.title === null
            ? getChapterLabel(current)
            : `${getChapterLabel(current)} – ${current.title}`}
        </p>
      </div>
      <SettingField label={m.reader_chapter()}>
        <ChapterPicker
          choices={choices}
          current={current}
          next={next}
          onSelect={onSelectChapter}
          prev={prev}
        />
      </SettingField>
      <SettingField label={m.reader_version()}>
        <VersionSelect current={current} onSelect={onSelectChapter} versions={versions} />
      </SettingField>
      <SettingField label={m.reader_page()}>
        <PageSelect onSelect={onSelectPage} page={page} pageCount={pageCount} />
      </SettingField>
    </section>
  )
}
