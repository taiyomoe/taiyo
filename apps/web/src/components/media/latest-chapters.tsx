import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CatchBoundary } from "@tanstack/react-router"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Suspense } from "react"

import { Reveal, Section, SectionHead } from "@/components/landing/landing-atoms"
import { ChapterList, ChapterRow } from "@/components/media/chapter-row"
import type { latestChaptersQueryOptions } from "@/lib/queries/chapters"
import { m } from "@/paraglide/messages"

type LatestChaptersOptions = ReturnType<typeof latestChaptersQueryOptions>

const SKELETON_ROWS = 6
const styles = stylex.create({
  band: {
    paddingBlock: "clamp(3.5rem,8vw,6rem)",
    scrollMarginTop: "2rem",
  },
  body: {
    gap: "2rem",
    display: "flex",
    flexDirection: "column",
  },
  list: {
    marginInline: "auto",
    maxWidth: "48rem",
    width: "100%",
  },
  skeleton: {
    borderRadius: radius.lg,
    height: "3.5rem",
  },
  skeletonList: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  message: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

function LatestChaptersList({ queryOptions }: { queryOptions: LatestChaptersOptions }) {
  const { data } = useSuspenseQuery(queryOptions)

  if (data.data.length === 0) {
    return <p sx={styles.message}>{m.home_latest_empty()}</p>
  }

  return (
    <ChapterList>
      {data.data.map((chapter) => (
        <ChapterRow
          chapter={chapter}
          key={chapter.id}
          mediaId={chapter.mediaId}
          mediaTitle={chapter.mediaTitle}
        />
      ))}
    </ChapterList>
  )
}

function LatestChaptersSkeleton() {
  return (
    <div sx={styles.skeletonList}>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} sx={styles.skeleton} />
      ))}
    </div>
  )
}

export function LatestChapters({ queryOptions }: { queryOptions: LatestChaptersOptions }) {
  return (
    <section id="latest" sx={styles.band}>
      <Section>
        <div sx={styles.body}>
          <Reveal>
            <SectionHead
              centered
              eyebrow={m.home_latest_eyebrow()}
              sub={m.home_latest_description()}
              title={m.home_latest_heading()}
            />
          </Reveal>
          <div sx={styles.list}>
            <CatchBoundary
              errorComponent={() => <p sx={styles.message}>{m.home_latest_unavailable()}</p>}
              getResetKey={() => "latest-chapters"}
            >
              <Suspense fallback={<LatestChaptersSkeleton />}>
                <LatestChaptersList queryOptions={queryOptions} />
              </Suspense>
            </CatchBoundary>
          </div>
        </div>
      </Section>
    </section>
  )
}
