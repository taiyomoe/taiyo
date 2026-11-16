import type { LibraryEntry } from "@/features/library/api/library"
import { m } from "@/paraglide/messages"

export const getProgressPercent = ({ readCount, totalCount }: LibraryEntry) =>
  totalCount === 0 ? 0 : Math.min(Math.round((readCount / totalCount) * 100), 100)

export const getUnreadCount = (entry: LibraryEntry) =>
  entry.status === "PLAN_TO_READ" || entry.status === "COMPLETED" || entry.status === "DROPPED"
    ? 0
    : Math.max(entry.totalCount - entry.readCount, 0)

/** The chapter the reading button opens, mirroring the media page: resume, continue, or start. */
export const getContinueTarget = ({ lastRead, next }: LibraryEntry) => {
  if (lastRead !== null && !lastRead.completed) {
    return {
      chapterId: lastRead.id,
      page: lastRead.page !== null && lastRead.page > 1 ? lastRead.page : undefined,
      label:
        lastRead.page === null || lastRead.page <= 1
          ? m.media_resume({ number: lastRead.number })
          : m.media_resume_page({ number: lastRead.number, page: lastRead.page }),
    }
  }

  if (next === null) {
    return null
  }

  return {
    chapterId: next.id,
    page: undefined,
    label: lastRead === null ? m.media_start_reading() : m.media_continue({ number: next.number }),
  }
}
