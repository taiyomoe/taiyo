import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link, Navigate } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { range } from "remeda"
import type { UserProfile } from "@/features/users/api/profile"
import { PagePagination } from "@/components/pagination/page-pagination"
import { latestMediaUpdatesQueryOptions } from "@/features/chapters/api/chapters"
import {
  LatestMediaCard,
  LatestMediaCardSkeleton,
} from "@/features/latest/components/latest-media-card"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { PROFILE_UPLOADS_PER_PAGE } from "@/features/users/lib/profile-page"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/users/$username")
const styles = stylex.create({
  root: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  cards: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function UploadsTab({ profile, page }: { profile: UserProfile; page: number }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(
    latestMediaUpdatesQueryOptions(contentRatings, page, PROFILE_UPLOADS_PER_PAGE, profile.id),
  )
  const navigate = routeApi.useNavigate()
  const pageCount = Math.ceil(data.meta.total / PROFILE_UPLOADS_PER_PAGE)
  const toSearch = (target: number) => ({
    tab: "uploads" as const,
    page: target === 1 ? undefined : target,
  })

  if (page > Math.max(pageCount, 1)) {
    return (
      <Navigate
        params={{ username: profile.username }}
        replace
        search={toSearch(Math.max(pageCount, 1))}
        to="/users/$username"
      />
    )
  }

  if (data.data.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.profile_uploads_empty_description({ name: profile.displayUsername })}
        title={m.profile_uploads_empty_title()}
      />
    )
  }

  return (
    <div sx={styles.root}>
      <div sx={styles.cards}>
        {data.data.map((media) => (
          <LatestMediaCard
            key={media.id}
            contentRatings={contentRatings}
            media={media}
            uploaderId={profile.id}
          />
        ))}
      </div>
      <PagePagination
        onJump={(target) => {
          void navigate({ search: toSearch(target), resetScroll: false })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => (
          <Link
            params={{ username: profile.username }}
            resetScroll={false}
            search={toSearch(target)}
            to="/users/$username"
          />
        )}
      />
    </div>
  )
}

export function UploadsTabSkeleton() {
  return (
    <div sx={styles.cards}>
      {range(0, 3).map((index) => (
        <LatestMediaCardSkeleton key={index} />
      ))}
    </div>
  )
}
