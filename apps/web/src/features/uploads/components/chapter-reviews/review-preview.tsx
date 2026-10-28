import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Globe } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { range } from "remeda"
import { type ChapterSubmission, chapterQueryOptions } from "@/features/uploads/api/submissions"
import { reviewStyles } from "@/features/uploads/components/chapter-reviews/review-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  pages: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    alignContent: "start",
    alignSelf: "start",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem, 1fr))",
    maxHeight: "28rem",
    overflowY: "auto",
  },
  page: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.muted,
    position: "relative",
  },
  pageImage: {
    aspectRatio: "3 / 4",
    display: "block",
    objectFit: "cover",
    width: "100%",
  },
  pageIndex: {
    borderRadius: radius.sm,
    paddingInline: "0.375rem",
    backgroundColor: "rgb(0 0 0 / 60%)",
    color: "white",
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    position: "absolute",
    bottom: "0.25rem",
    left: "0.25rem",
  },
  skeleton: {
    borderRadius: radius.md,
    aspectRatio: "3 / 4",
  },
  external: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  externalLink: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontWeight: 500,
    overflowWrap: "anywhere",
  },
})

export function ReviewPreview({ submission }: { submission: ChapterSubmission }) {
  const chapter = useQuery(chapterQueryOptions(submission.id))
  const pages = chapter.data?.pages
  let previews: ReactNode = <p sx={reviewStyles.muted}>{m.review_chapter_no_pages()}</p>

  if (pages === undefined) {
    previews = (
      <ol sx={styles.pages}>
        {range(0, Math.min(Math.max(submission.pageCount, 1), 8)).map((index) => (
          <li key={index}>
            <Skeleton sx={styles.skeleton} />
          </li>
        ))}
      </ol>
    )
  } else if (pages !== null && pages.length > 0) {
    previews = (
      <ol sx={styles.pages}>
        {pages.map((page, index) => (
          <li key={page.id} sx={styles.page}>
            <a href={page.url} rel="noreferrer" target="_blank">
              <img alt="" loading="lazy" src={page.url} sx={styles.pageImage} />
            </a>
            <span sx={styles.pageIndex}>{index + 1}</span>
          </li>
        ))}
      </ol>
    )
  }

  if (submission.isExternal && submission.externalUrl !== null) {
    return (
      <div sx={styles.external}>
        <p sx={reviewStyles.muted}>{m.review_chapter_external()}</p>
        <a
          href={submission.externalUrl}
          rel="noopener noreferrer nofollow ugc"
          sx={styles.externalLink}
          target="_blank"
        >
          <Globe size={16} />
          {submission.externalUrl}
        </a>
      </div>
    )
  }

  return previews
}
