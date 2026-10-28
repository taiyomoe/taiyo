import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link, getRouteApi } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import type { MediaChapter } from "@/features/chapters/api/chapters"
import { PagePagination } from "@/components/pagination/page-pagination"
import { MediaChapterListBody } from "@/features/media/components/media-chapters/media-chapter-list-body"
import { CHAPTERS_PER_PAGE } from "@/features/media/lib/media-page"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/media/$mediaId")
const styles = stylex.create({
  list: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    scrollMarginTop: "calc(var(--navbar-height) + 1rem)",
  },
  card: {
    padding: { [breakpoints.md]: "0.875rem", default: "0.625rem" },
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cardHeader: {
    gap: "1rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minWidth: 0,
    paddingBottom: "0.625rem",
  },
  cardTitle: {
    margin: 0,
    overflow: "hidden",
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: { [breakpoints.md]: "1.125rem", default: "1rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardCount: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
})

type MediaChapterListProps = {
  title: string
  chapters: MediaChapter[] | undefined
  total: number
  page: number
  stale: boolean
  filtered: boolean
  onClear: () => void
}

export function MediaChapterList({
  title,
  chapters,
  total,
  page,
  stale,
  filtered,
  onClear,
}: MediaChapterListProps) {
  const ref = useRef<HTMLElement>(null)
  const previousPage = useRef(page)
  const navigate = routeApi.useNavigate()
  const pageCount = Math.ceil(total / CHAPTERS_PER_PAGE)

  useEffect(() => {
    if (previousPage.current !== page && ref.current !== null) {
      if (ref.current.getBoundingClientRect().top < 0) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }

    previousPage.current = page
  }, [page])

  return (
    <section aria-labelledby="media-chapters-title" ref={ref} sx={styles.list}>
      <div sx={styles.card}>
        <div sx={styles.cardHeader}>
          <h3 id="media-chapters-title" sx={styles.cardTitle}>
            {title}
          </h3>
          {chapters === undefined ? null : (
            <span sx={styles.cardCount}>
              {m.media_chapters_count({ total, shown: chapters.length })}
            </span>
          )}
        </div>
        <MediaChapterListBody
          chapters={chapters}
          filtered={filtered}
          onClear={onClear}
          stale={stale}
        />
      </div>
      <PagePagination
        onJump={(target) => {
          void navigate({
            resetScroll: false,
            search: (previous) => ({ ...previous, page: target === 1 ? undefined : target }),
          })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => (
          <Link
            from="/media/$mediaId"
            resetScroll={false}
            search={(previous) => ({ ...previous, page: target === 1 ? undefined : target })}
          />
        )}
      />
    </section>
  )
}
