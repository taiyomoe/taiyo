import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, Navigate, useNavigate } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { range } from "remeda"
import { PagePagination } from "@/components/pagination/page-pagination"
import { latestMediaUpdatesQueryOptions } from "@/features/chapters/api/chapters"
import {
  LatestMediaCard,
  LatestMediaCardSkeleton,
} from "@/features/latest/components/latest-media-card"
import { LATEST_MEDIAS_PER_PAGE } from "@/features/latest/lib/pagination"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  cards: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function LatestPageContent({ page }: { page: number }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(
    latestMediaUpdatesQueryOptions(contentRatings, page, LATEST_MEDIAS_PER_PAGE),
  )
  const navigate = useNavigate()
  const pageCount = Math.ceil(data.meta.total / LATEST_MEDIAS_PER_PAGE)

  if (page > Math.max(pageCount, 1)) {
    return (
      <Navigate replace search={{ page: pageCount > 1 ? pageCount : undefined }} to="/latest" />
    )
  }

  if (data.data.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.latest_empty_description()}
        title={m.latest_empty_title()}
      />
    )
  }

  return (
    <>
      <div sx={styles.cards}>
        {data.data.map((media) => (
          <LatestMediaCard key={media.id} contentRatings={contentRatings} media={media} />
        ))}
      </div>
      <PagePagination
        renderLink={(target) => (
          <Link search={{ page: target === 1 ? undefined : target }} to="/latest" />
        )}
        onJump={(target) => {
          void navigate({ search: { page: target === 1 ? undefined : target }, to: "/latest" })
        }}
        page={page}
        pageCount={pageCount}
      />
    </>
  )
}

export function LatestPageContentSkeleton() {
  return (
    <div sx={styles.cards}>
      {range(0, 4).map((index) => (
        <LatestMediaCardSkeleton key={index} />
      ))}
    </div>
  )
}
