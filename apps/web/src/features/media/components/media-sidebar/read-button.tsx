import * as stylex from "@stylexjs/stylex"
import { Book } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { ReadingProgress } from "@/features/media/api/library"
import { mediaChaptersQueryOptions } from "@/features/chapters/api/chapters"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  cta: {
    width: "100%",
  },
})

export function ReadButton({
  mediaId,
  progress,
}: {
  mediaId: string
  progress: ReadingProgress | null
}) {
  const { contentRatings } = useSettings()
  const first = useQuery({
    ...mediaChaptersQueryOptions(mediaId, {
      contentRatings,
      page: 1,
      perPage: 1,
      sort: "oldest",
      unread: false,
    }),
    enabled: progress === null,
  })
  const next = progress?.next ?? null
  const lastRead = progress?.lastRead ?? null
  const resume = lastRead !== null && !lastRead.completed ? lastRead : null
  let target = progress === null ? (first.data?.data[0] ?? null) : (next ?? lastRead)
  let label = next === null ? m.media_caught_up() : m.media_continue({ number: next.number })

  if (lastRead === null) {
    label = m.media_start_reading()
  }

  if (resume !== null) {
    target = resume
    label =
      resume.page === null || resume.page <= 1
        ? m.media_resume({ number: resume.number })
        : m.media_resume_page({ number: resume.number, page: resume.page })
  }

  if (target === null) {
    return (
      <Button disabled size="lg" sx={styles.cta}>
        <Book />
        {label}
      </Button>
    )
  }

  return (
    <Button
      render={
        <Link
          params={{ chapterId: target.id }}
          search={{ page: resume?.page ?? undefined }}
          to="/chapters/$chapterId"
        />
      }
      size="lg"
      sx={styles.cta}
    >
      <Book />
      {label}
    </Button>
  )
}
