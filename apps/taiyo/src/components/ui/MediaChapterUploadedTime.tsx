import type { LatestRelease, MediaLimitedChapter } from "@taiyomoe/types"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { ClockIcon } from "lucide-react"
import { cn } from "~/lib/utils/cn"

type Props = {
  chapter: MediaLimitedChapter | LatestRelease
  className?: string
}

export const MediaChapterCardUploadedTime = ({ chapter, className }: Props) => {
  return (
    <div
      className={cn("flex w-full items-center justify-end gap-1", className)}
    >
      <ClockIcon className="h-4 w-auto md:h-5" />
      <p className="select-none rounded px-1 text-sm md:px-2">
        {MediaChapterUtils.computeUploadedTime(chapter)}
      </p>
    </div>
  )
}
