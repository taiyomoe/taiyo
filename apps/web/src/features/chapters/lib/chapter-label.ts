import type { LatestChapter } from "@/features/chapters/api/chapters"
import { m } from "@/paraglide/messages"

export const getChapterLabel = (chapter: Pick<LatestChapter, "number" | "volume">) =>
  [
    chapter.volume === null ? null : m.chapter_volume({ volume: chapter.volume }),
    m.chapter_number({ number: chapter.number }),
  ]
    .filter((part) => part !== null)
    .join(" ")
