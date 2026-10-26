import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { range } from "remeda"
import {
  type ChapterListItem,
  ChapterListRow,
} from "@/features/chapters/components/chapter-list-row"
import { chapterListStyles } from "@/features/chapters/components/chapter-list-styles"

const styles = stylex.create({
  chapters: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  skeletonLabel: {
    gridColumnEnd: "label",
    gridColumnStart: "label",
    gridRowEnd: "label",
    gridRowStart: "label",
    height: "0.875rem",
    width: "min(16rem, 80%)",
  },
  skeletonMeta: {
    gridColumnEnd: "groups",
    gridColumnStart: "groups",
    gridRowEnd: "groups",
    gridRowStart: "groups",
    height: "0.75rem",
    width: "min(9rem, 50%)",
  },
})

export function ChapterList({ chapters, sx }: { chapters: ChapterListItem[]; sx?: Sx }) {
  return (
    <ul sx={[styles.chapters, sx]}>
      {chapters.map((chapter) => (
        <ChapterListRow key={chapter.id} chapter={chapter} />
      ))}
    </ul>
  )
}

export function ChapterListSkeleton({ count, sx }: { count: number; sx?: Sx }) {
  return (
    <ul aria-hidden sx={[styles.chapters, sx]}>
      {range(0, count).map((index) => (
        <li key={index} sx={chapterListStyles.chapter}>
          <Skeleton sx={styles.skeletonLabel} />
          <Skeleton sx={styles.skeletonMeta} />
        </li>
      ))}
    </ul>
  )
}
