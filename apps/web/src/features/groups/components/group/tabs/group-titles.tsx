import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { breakpoints, colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense, useDeferredValue } from "react"
import { range } from "remeda"
import type { GroupMedia } from "@/features/groups/api/groups"
import type { GroupMediaSort } from "@/features/groups/lib/group-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { formatTimeAgo } from "@/components/time/format-time-ago"
import { groupMediasQueryOptions } from "@/features/groups/api/groups"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { GROUP_MEDIA_SORTS, GROUP_TITLES_PER_PAGE } from "@/features/groups/lib/group-page"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { useNow } from "@/hooks/use-now"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const SORT_LABELS: Record<GroupMediaSort, () => string> = {
  recent: m.group_titles_sort_recent,
  chapters: m.group_titles_sort_chapters,
  title: m.group_titles_sort_title,
}
const routeApi = getRouteApi("/groups/$groupId")
const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.sm]: {
        default: "repeat(3, minmax(0, 1fr))",
        [breakpoints.xl]: "repeat(5, minmax(0, 1fr))",
      },
    },
    rowGap: "1.5rem",
  },
  card: {
    borderRadius: radius.lg,
    gap: "0.625rem",
    textDecoration: "none",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    outlineColor: colors.ring,
    outlineOffset: 4,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  coverFrame: {
    position: "relative",
  },
  cover: {
    borderRadius: radius.lg,
    width: "100%",
  },
  pill: {
    borderRadius: radius.full,
    paddingBlock: "0.125rem",
    paddingInline: "0.5rem",
    backgroundColor: colors.primary,
    boxShadow: "0 1px 4px rgb(0 0 0 / 0.25)",
    color: colors.primaryForeground,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontWeight: 600,
    position: "absolute",
    whiteSpace: "nowrap",
  },
  byUs: {
    left: "0.5rem",
    top: "0.5rem",
  },
  latest: {
    bottom: "0.5rem",
    right: "0.5rem",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: {
      default: colors.foreground,
      ":is(a:hover *)": `color-mix(in srgb, ${colors.foreground} 72%, ${colors.background})`,
    },
    display: "-webkit-box",
    fontFamily: font.heading,
    fontSize: "1rem",
    fontWeight: font.weightBold,
    lineHeight: 1.25,
    transitionDuration: motion.enter,
    transitionProperty: "color",
  },
  meta: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  skeletonText: {
    height: "1rem",
    width: "80%",
  },
})

export function GroupTitles({ groupId }: { groupId: string }) {
  const { sort = "recent" } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()

  return (
    <div sx={groupStyles.panel}>
      <div sx={groupStyles.toolbar}>
        <Suspense fallback={<span />}>
          <TitleCount groupId={groupId} />
        </Suspense>
        <Tabs
          onValueChange={(next: GroupMediaSort) => {
            void navigate({
              resetScroll: false,
              search: (previous) => ({
                ...previous,
                sort: next === "recent" ? undefined : next,
                page: undefined,
              }),
            })
          }}
          value={sort}
        >
          <TabsList aria-label={m.group_titles_sort()}>
            {GROUP_MEDIA_SORTS.map((value) => (
              <TabsTab key={value} value={value}>
                {SORT_LABELS[value]()}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Suspense fallback={<GroupTitlesSkeleton />}>
        <GroupTitleGrid groupId={groupId} />
      </Suspense>
    </div>
  )
}

function useGroupMedias(groupId: string) {
  const { sort = "recent", page = 1 } = routeApi.useSearch()
  const contentRatings = useDeferredValue(useSettings().contentRatings)

  return useSuspenseQuery(
    groupMediasQueryOptions(groupId, contentRatings, {
      page,
      perPage: GROUP_TITLES_PER_PAGE,
      sort,
    }),
  )
}

function TitleCount({ groupId }: { groupId: string }) {
  const { data } = useGroupMedias(groupId)

  return (
    <p sx={groupStyles.count}>
      {data.meta.total === 1
        ? m.group_titles_count_one()
        : m.group_titles_count({ count: data.meta.total })}
    </p>
  )
}

function GroupTitleGrid({ groupId }: { groupId: string }) {
  const search = routeApi.useSearch()
  const { page = 1 } = search
  const navigate = routeApi.useNavigate()
  const { data } = useGroupMedias(groupId)

  if (data.data.length === 0) {
    return <p sx={groupStyles.muted}>{m.group_titles_empty()}</p>
  }

  return (
    <>
      <ul sx={styles.grid}>
        {data.data.map((media) => (
          <TitleCard key={media.id} media={media} />
        ))}
      </ul>
      <PagePagination
        onJump={(target) => {
          void navigate({
            search: (previous) => ({ ...previous, page: target === 1 ? undefined : target }),
          })
        }}
        page={page}
        pageCount={Math.ceil(data.meta.total / GROUP_TITLES_PER_PAGE)}
        renderLink={(target) => (
          <Link
            params={{ groupId }}
            search={{ ...search, page: target === 1 ? undefined : target }}
            to="/groups/$groupId"
          />
        )}
      />
    </>
  )
}

function TitleCard({ media }: { media: GroupMedia }) {
  const now = useNow()

  return (
    <li>
      <Link params={{ mediaId: media.id }} to="/media/$mediaId" {...stylex.props(styles.card)}>
        <span sx={styles.coverFrame}>
          <Cover alt={media.title ?? ""} src={media.coverUrl} sx={styles.cover} />
          <span sx={[styles.pill, styles.byUs]}>
            {m.group_titles_by_us({ count: media.chapterCount })}
          </span>
          <span sx={[styles.pill, styles.latest]}>
            {m.chapter_number({ number: media.latestNumber })}
          </span>
        </span>
        <span sx={styles.text}>
          <span sx={styles.title}>{media.title ?? m.media_untitled()}</span>
          {media.authors.length === 0 ? null : (
            <span sx={styles.meta}>{media.authors.join(", ")}</span>
          )}
          <span sx={styles.meta}>
            {m.group_titles_last_release({
              time: formatTimeAgo(new Date(media.latestAt), now, "short"),
            })}
          </span>
        </span>
      </Link>
    </li>
  )
}

function GroupTitlesSkeleton() {
  return (
    <ul aria-hidden sx={styles.grid}>
      {range(0, 10).map((index) => (
        <li key={index} sx={styles.card}>
          <CoverSkeleton sx={styles.cover} />
          <Skeleton sx={styles.skeletonText} />
        </li>
      ))}
    </ul>
  )
}
