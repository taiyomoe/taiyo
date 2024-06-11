import type {} from "@taiyomoe/types"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { ClockIcon } from "lucide-react"
import { cn } from "~/lib/utils/cn"

type Props = {
  chapter: { createdAt: Date }
  className?: string
}

export const ChapterUploadedTime = ({ chapter, className }: Props) => (
  <div className={cn("flex w-full items-center justify-end gap-1", className)}>
    <ClockIcon className="h-4 w-auto md:h-5" />
    <p className="select-none rounded px-1 text-sm md:px-2">
      {MediaChapterUtils.computeUploadedTime(chapter)}
    </p>
  </div>
)
