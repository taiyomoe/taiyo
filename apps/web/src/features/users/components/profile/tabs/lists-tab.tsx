import * as stylex from "@stylexjs/stylex"
import { List, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link, Navigate } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { range } from "remeda"
import type { UserProfile } from "@/features/users/api/profile"
import { PagePagination } from "@/components/pagination/page-pagination"
import { USER_LISTS_PER_PAGE, userListsQueryOptions } from "@/features/lists/api/lists"
import {
  ListCard,
  ListCardSkeleton,
  listCardGridStyles,
} from "@/features/lists/components/list-card"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/users/$username")
const styles = stylex.create({
  root: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function ListsTab({
  profile,
  page,
  isOwner,
}: {
  profile: UserProfile
  page: number
  isOwner: boolean
}) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(userListsQueryOptions(profile.id, page, contentRatings))
  const navigate = routeApi.useNavigate()
  const pageCount = Math.ceil(data.meta.total / USER_LISTS_PER_PAGE)
  const toSearch = (target: number) => ({
    tab: "lists" as const,
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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <List />
          </EmptyMedia>
          <EmptyTitle>{m.profile_lists_empty_title()}</EmptyTitle>
          <EmptyDescription>
            {isOwner
              ? m.profile_lists_empty_description_owner()
              : m.profile_lists_empty_description({ name: profile.displayUsername })}
          </EmptyDescription>
        </EmptyHeader>
        {isOwner ? (
          <EmptyContent>
            <Button render={<Link to="/lists/new" />} size="sm" variant="outline">
              <Plus />
              {m.lists_new()}
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    )
  }

  return (
    <div sx={styles.root}>
      <div sx={listCardGridStyles.grid}>
        {data.data.map((list) => (
          <ListCard key={list.id} list={list} showOwner={false} />
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

export function ListsTabSkeleton() {
  return (
    <div sx={listCardGridStyles.grid}>
      {range(0, 4).map((index) => (
        <ListCardSkeleton key={index} />
      ))}
    </div>
  )
}
