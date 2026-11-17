import * as stylex from "@stylexjs/stylex"
import { Image } from "@taiyomoe/ui/components/icons"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

type ChapterPagesProps = {
  chapter: { pageCount: number; isExternal: boolean }
}

/** The page count of a chapter in its own column. */
export function ChapterPages({ chapter }: ChapterPagesProps) {
  return chapter.isExternal ? (
    <span sx={catalogStyles.muted}>{m.catalog_chapter_external()}</span>
  ) : (
    <span sx={catalogStyles.numeric}>{formatNumber(chapter.pageCount)}</span>
  )
}

/** The page count of a chapter folded under its title, where the column is hidden. */
export function FoldedChapterPages({ chapter }: ChapterPagesProps) {
  return (
    <span
      {...stylex.props(catalogStyles.inline, catalogStyles.muted)}
      title={
        chapter.isExternal
          ? undefined
          : m.catalog_chapter_pages({ count: formatNumber(chapter.pageCount) })
      }
    >
      <Image size={14} />
      {chapter.isExternal ? m.catalog_chapter_external() : formatNumber(chapter.pageCount)}
    </span>
  )
}
