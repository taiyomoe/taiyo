import * as stylex from "@stylexjs/stylex"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import type { Session } from "@/lib/session"
import {
  mediaChapterFacetsQueryOptions,
  mediaChaptersQueryOptions,
} from "@/features/chapters/api/chapters"
import { UpcomingChapters } from "@/features/chapters/components/upcoming-chapters"
import { ChaptersToolbar } from "@/features/media/components/media-chapters/chapters-toolbar"
import { MediaChapterList } from "@/features/media/components/media-chapters/media-chapter-list"
import { VolumeRail } from "@/features/media/components/media-chapters/volume-rail"
import { NO_VOLUME, getVolumeName } from "@/features/media/lib/chapter-volumes"
import { CHAPTERS_PER_PAGE } from "@/features/media/lib/media-page"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const WIDE = "@media (width >= 72rem)"
const routeApi = getRouteApi("/media/$mediaId")
const styles = stylex.create({
  root: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  body: {
    gap: "1.25rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { [WIDE]: "15rem minmax(0, 1fr)", default: "minmax(0, 1fr)" },
  },
})

type ChapterSearch = ReturnType<typeof routeApi.useSearch>

type MediaChaptersProps = {
  mediaId: string
  user: Session["user"] | null
}

export function MediaChapters({ mediaId, user }: MediaChaptersProps) {
  const signedIn = user !== null
  const search = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const sort = search.sort ?? "newest"
  const page = search.page ?? 1
  const unread = signedIn && search.unread === true
  const filters = { contentRatings, language: search.lang }
  const facets = useQuery({
    ...mediaChapterFacetsQueryOptions(mediaId, filters),
    placeholderData: keepPreviousData,
  })
  const chapters = useQuery({
    ...mediaChaptersQueryOptions(mediaId, {
      ...filters,
      page,
      perPage: CHAPTERS_PER_PAGE,
      sort,
      volume: search.volume,
      search: search.q,
      unread,
    }),
    placeholderData: keepPreviousData,
  })
  const update = (patch: Partial<ChapterSearch>) => {
    void navigate({
      replace: true,
      resetScroll: false,
      search: (previous) => ({ ...previous, page: undefined, ...patch }),
    })
  }
  const filtered =
    search.lang !== undefined || search.volume !== undefined || search.q !== undefined || unread
  const languages = facets.data?.languages ?? []
  const upcoming = <UpcomingChapters mediaId={mediaId} user={user} />

  if (facets.data?.total === 0 && search.lang === undefined) {
    return (
      <div sx={styles.root}>
        {upcoming}
        <ContentFilterEmpty
          description={m.media_chapters_none_description()}
          title={m.media_chapters_none_title()}
        />
      </div>
    )
  }

  return (
    <div sx={styles.root}>
      {upcoming}
      <ChaptersToolbar
        language={search.lang}
        languages={languages}
        onLanguageChange={(lang) => {
          update({ lang })
        }}
        onSearch={(q) => {
          update({ q })
        }}
        onSortChange={(value) => {
          update({ sort: value === "newest" ? undefined : value })
        }}
        onUnreadChange={(checked) => {
          update({ unread: checked ? true : undefined })
        }}
        query={search.q}
        signedIn={signedIn}
        sort={sort}
        unread={unread}
      />
      <div sx={styles.body}>
        {facets.data !== undefined && facets.data.volumes.some(({ volume }) => volume !== null) ? (
          <VolumeRail
            facets={facets.data}
            onSelect={(volume) => {
              update({ volume })
            }}
            selected={search.volume}
          />
        ) : null}
        <MediaChapterList
          chapters={chapters.data?.data}
          filtered={filtered}
          onClear={() => {
            update({ lang: undefined, q: undefined, unread: undefined, volume: undefined })
          }}
          page={page}
          stale={chapters.isPlaceholderData}
          title={
            search.volume === undefined
              ? m.media_chapters_all()
              : getVolumeName(search.volume === NO_VOLUME ? null : search.volume)
          }
          total={chapters.data?.meta.total ?? 0}
        />
      </div>
    </div>
  )
}
