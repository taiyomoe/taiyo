import * as stylex from "@stylexjs/stylex"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, Navigate, useNavigate } from "@tanstack/react-router"
import { Suspense, useDeferredValue } from "react"
import { range } from "remeda"
import type { Session } from "@/lib/queries/session"
import { LatestMediaCard, LatestMediaCardSkeleton } from "@/components/latest/latest-media-card"
import { PagePagination } from "@/components/pagination/page-pagination"
import { sceneFont } from "@/components/scene/scene.stylex"
import { ContentFilterEmpty } from "@/components/settings/content-filter"
import { AppShell } from "@/components/shell/app-shell"
import { latestMediaUpdatesQueryOptions } from "@/lib/queries/chapters"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const LATEST_MEDIAS_PER_PAGE = 10

const styles = stylex.create({
  page: {
    gap: "1.5rem",
    paddingBlock: "2rem",
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2rem" },
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  back: {
    color: colors.mutedForeground,
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", "@media (width >= 48rem)": "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  cards: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function LatestPage({ user, page }: { user: Session["user"]; page: number }) {
  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <div sx={styles.header}>
          <Button
            aria-label={m.latest_back()}
            render={<Link to="/" />}
            size="icon"
            sx={styles.back}
            variant="ghost"
          >
            <ArrowLeft />
          </Button>
          <h1 sx={styles.heading}>{m.home_latest_title()}</h1>
        </div>
        <Suspense fallback={<LatestPageSkeleton />}>
          <LatestPageContent page={page} />
        </Suspense>
      </div>
    </AppShell>
  )
}

function LatestPageContent({ page }: { page: number }) {
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

function LatestPageSkeleton() {
  return (
    <div sx={styles.cards}>
      {range(0, 4).map((index) => (
        <LatestMediaCardSkeleton key={index} />
      ))}
    </div>
  )
}
