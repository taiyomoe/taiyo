import { tv } from "@nextui-org/react"
import type { MediaLimitedChapter } from "@taiyomoe/types"
import { ChapterUtils } from "@taiyomoe/utils"
import Link from "next/link"
import { useState } from "react"
import { ChapterScansListHorizontal } from "~/components/ui/chapters/chapter-scans-list-horizontal"
import { ChapterTitle } from "~/components/ui/chapters/chapter-title"
import { ChapterUploadedTime } from "~/components/ui/chapters/chapter-uploaded-time"
import { ChapterUploader } from "~/components/ui/chapters/chapter-uploader"
import { MediaChaptersTabRowProgressionButton } from "./media-chapters-tab-row-progression-button"

type Props = {
  chapter: MediaLimitedChapter
  order: "unique" | "first" | "middle" | "last"
  index: number
}

const mediaChaptersTabRowCard = tv({
  base: "grid w-full grid-cols-chapterCard grid-rows-2 gap-x-1 gap-y-0.5 rounded-md border-l-2 bg-content1 p-2 text-small transition-colors",
  variants: {
    completed: {
      null: "",
      true: "border-l-content1",
      false: "border-l-primary",
    },
    order: {
      unique: "",
      first: "rounded-b-none border-b border-b-content3",
      middle: "rounded-t-none rounded-b-none border-y border-y-content3",
      last: "rounded-t-none border-t border-t-content3",
    },
  },
})

export const MediaChaptersTabRowCard = ({ chapter, order, index }: Props) => {
  const [completed, setCompleted] = useState(chapter.completed ?? false)

  return (
    <Link
      className={mediaChaptersTabRowCard({ completed, order })}
      href={ChapterUtils.getUrl(chapter)}
    >
      <div className="flex items-center gap-2">
        <MediaChaptersTabRowProgressionButton
          chapter={chapter}
          completed={completed}
          setCompleted={setCompleted}
        />
        <ChapterTitle chapter={chapter} />
      </div>
      <ChapterUploadedTime className="min-w-28" chapter={chapter} />
      <ChapterScansListHorizontal
        chapter={chapter}
        index={index}
        noisyWidth={216}
      />
      <ChapterUploader chapter={chapter} />
    </Link>
  )
}
