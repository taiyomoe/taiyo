import * as stylex from "@stylexjs/stylex"
import { Library } from "@taiyomoe/ui/components/icons"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense, useDeferredValue } from "react"
import type { GroupChapterOrder } from "@/features/groups/lib/group-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  groupMediaUpdatesQueryOptions,
  groupMediasQueryOptions,
} from "@/features/groups/api/groups"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import {
  GROUP_CHAPTER_ORDERS,
  GROUP_MEDIAS_PER_PAGE,
  GROUP_TITLE_OPTIONS,
} from "@/features/groups/lib/group-page"
import { LatestMediaCard } from "@/features/latest/components/latest-media-card"
import { LatestPageContentSkeleton } from "@/features/latest/components/latest-page-content"
import { ChapterSearchField } from "@/features/media/components/media-chapters/chapter-search-field"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const ALL_TITLES = "all"
const ORDER_LABELS: Record<GroupChapterOrder, () => string> = {
  latest: m.group_chapters_latest,
  oldest: m.group_chapters_oldest,
}
const routeApi = getRouteApi("/groups/$groupId")
const styles = stylex.create({
  toolbar: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  trigger: {
    flexBasis: { default: "100%", [breakpoints.sm]: "14rem" },
    flexGrow: { default: 1, [breakpoints.sm]: 0 },
    maxWidth: { default: null, [breakpoints.sm]: "18rem" },
    minWidth: 0,
  },
  triggerValue: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  triggerText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  triggerIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  cards: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function GroupChapters({ groupId }: { groupId: string }) {
  const { q, title, order = "latest" } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const titles = useQuery(
    groupMediasQueryOptions(groupId, contentRatings, {
      page: 1,
      perPage: GROUP_TITLE_OPTIONS,
      sort: "title",
    }),
  )
  const options = titles.data?.data ?? []
  const selected = options.find((option) => option.id === title)

  return (
    <div sx={groupStyles.panel}>
      <div sx={styles.toolbar}>
        <ChapterSearchField
          onSearch={(next) => {
            void navigate({
              replace: true,
              resetScroll: false,
              search: (previous) => ({ ...previous, q: next, page: undefined }),
            })
          }}
          placeholder={m.group_chapters_search()}
          value={q ?? ""}
        />
        <Select
          onValueChange={(next) => {
            void navigate({
              resetScroll: false,
              search: (previous) => ({
                ...previous,
                title: next === null || next === ALL_TITLES ? undefined : next,
                page: undefined,
              }),
            })
          }}
          value={title ?? ALL_TITLES}
        >
          <SelectTrigger aria-label={m.group_chapters_title_filter()} sx={styles.trigger}>
            <SelectValue>
              {() => (
                <span sx={styles.triggerValue}>
                  <Library size={16} {...stylex.props(styles.triggerIcon)} />
                  <span sx={styles.triggerText}>
                    {selected === undefined
                      ? m.group_chapters_all_titles()
                      : (selected.title ?? m.media_untitled())}
                  </span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectPopup>
            <SelectItem value={ALL_TITLES}>{m.group_chapters_all_titles()}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.title ?? m.media_untitled()}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        <Tabs
          onValueChange={(next: GroupChapterOrder) => {
            void navigate({
              resetScroll: false,
              search: (previous) => ({
                ...previous,
                order: next === "latest" ? undefined : next,
                page: undefined,
              }),
            })
          }}
          value={order}
        >
          <TabsList aria-label={m.group_chapters_order()}>
            {GROUP_CHAPTER_ORDERS.map((value) => (
              <TabsTab key={value} value={value}>
                {ORDER_LABELS[value]()}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Suspense fallback={<LatestPageContentSkeleton />}>
        <GroupChapterList groupId={groupId} />
      </Suspense>
    </div>
  )
}

function GroupChapterList({ groupId }: { groupId: string }) {
  const search = routeApi.useSearch()
  const { q, title, order = "latest", page = 1 } = search
  const navigate = routeApi.useNavigate()
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(
    groupMediaUpdatesQueryOptions(groupId, contentRatings, {
      page,
      perPage: GROUP_MEDIAS_PER_PAGE,
      order,
      search: q,
      mediaId: title,
    }),
  )

  if (data.data.length === 0) {
    return (
      <p sx={groupStyles.muted}>
        {q === undefined && title === undefined
          ? m.group_chapters_empty()
          : m.group_chapters_no_match()}
      </p>
    )
  }

  return (
    <>
      <p sx={groupStyles.count}>
        {data.meta.total === 1
          ? m.group_chapters_count_one()
          : m.group_chapters_count({ count: data.meta.total })}
        {" · "}
        {order === "latest" ? m.group_chapters_newest_first() : m.group_chapters_oldest_first()}
      </p>
      <div sx={styles.cards}>
        {data.data.map((media) => (
          <LatestMediaCard
            key={media.id}
            contentRatings={contentRatings}
            groupId={groupId}
            media={media}
          />
        ))}
      </div>
      <PagePagination
        onJump={(target) => {
          void navigate({
            search: (previous) => ({ ...previous, page: target === 1 ? undefined : target }),
          })
        }}
        page={page}
        pageCount={Math.ceil(data.meta.total / GROUP_MEDIAS_PER_PAGE)}
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
