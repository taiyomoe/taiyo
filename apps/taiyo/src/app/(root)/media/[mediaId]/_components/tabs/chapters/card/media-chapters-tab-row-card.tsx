import { tv } from "@nextui-org/react"
import type { LatestReleaseGrouped, MediaLimitedChapter } from "@taiyomoe/types"
import { ChapterUtils } from "@taiyomoe/utils"
import Link from "next/link"
import { useState } from "react"
import { ChapterScansListHorizontal } from "~/components/ui/chapters/chapter-scans-list-horizontal"
import { ChapterTitle } from "~/components/ui/chapters/chapter-title"
import { ChapterUploadedTime } from "~/components/ui/chapters/chapter-uploaded-time"
import { ChapterUploader } from "~/components/ui/chapters/chapter-uploader"
import { MediaChaptersTabRowProgressionButton } from "./media-chapters-tab-row-progression-button"

type Props = {
  chapter: MediaLimitedChapter | LatestReleaseGrouped["chapters"][number]
  order: "unique" | "first" | "middle" | "last"
  index: number
  noisyWidth: number
}

const mediaChaptersTabRowCard2 = tv({
  slots: {
    card: "grid h-full w-full grid-cols-chapterCard grid-rows-2 gap-x-1 gap-y-0.5 rounded-md border-l-2 bg-content1 p-2 text-small transition-colors",
    top: "h-px border-l-2 border-l-content1 bg-content3",
    bottom: "h-px border-l-2 border-l-content1 bg-content3",
  },
  variants: {
    completed: {
      null: "",
      true: {
        card: "border-l-content1",
      },
      false: {
        card: "border-l-primary",
        top: "border-l-primary",
        bottom: "border-l-primary",
      },
    },
    order: {
      unique: {
        top: "h-0",
        bottom: "h-0",
      },
      first: {
        card: "rounded-b-none",
        top: "h-0",
      },
      middle: {
        card: "rounded-t-none rounded-b-none",
      },
      last: {
        card: "rounded-t-none",
        bottom: "h-0",
      },
    },
  },
})

export const MediaChaptersTabRowCard = ({ chapter, order, ...rest }: Props) => {
  const [completed, setCompleted] = useState(chapter.completed ?? false)
  const slots = mediaChaptersTabRowCard2({ completed, order })

  return (
    <div className="flex grow flex-col">
      <div className={slots.top()} />
      <Link className={slots.card()} href={ChapterUtils.getUrl(chapter)}>
        <div className="flex items-center gap-2">
          <MediaChaptersTabRowProgressionButton
            chapter={chapter}
            completed={completed}
            setCompleted={setCompleted}
          />
          <ChapterTitle chapter={chapter} />
        </div>
        <ChapterUploadedTime className="min-w-28" chapter={chapter} />
        <ChapterScansListHorizontal chapter={chapter} {...rest} />
        <ChapterUploader chapter={chapter} />
      </Link>
      <div className={slots.bottom()} />
    </div>
  )
}
