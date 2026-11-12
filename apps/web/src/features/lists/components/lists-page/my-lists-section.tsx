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
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { range } from "remeda"
import { myListsQueryOptions } from "@/features/lists/api/lists"
import {
  ListCard,
  ListCardSkeleton,
  listCardGridStyles,
} from "@/features/lists/components/list-card"
import { listsPageStyles } from "@/features/lists/components/lists-page/lists-page-styles"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const PREVIEW_COUNT = 5
const styles = stylex.create({
  skeletonTitle: {
    borderRadius: radius.sm,
    height: "1.25rem",
    width: "8rem",
  },
})

export function MyListsSection({ username }: { username: string | null | undefined }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(myListsQueryOptions(contentRatings))

  return (
    <section sx={listsPageStyles.section}>
      <div sx={listsPageStyles.sectionHeader}>
        <h2 sx={listsPageStyles.sectionTitle}>
          {m.lists_mine_title()}
          {data.meta.total === 0 ? null : (
            <span sx={listsPageStyles.sectionCount}>{data.meta.total}</span>
          )}
        </h2>
        {username !== null && username !== undefined && data.meta.total > PREVIEW_COUNT ? (
          <Button
            render={<Link params={{ username }} search={{ tab: "lists" }} to="/users/$username" />}
            size="sm"
            variant="ghost"
          >
            {m.lists_mine_view_all()}
          </Button>
        ) : null}
      </div>
      {data.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <List />
            </EmptyMedia>
            <EmptyTitle>{m.lists_mine_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.lists_mine_empty_description()}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to="/lists/new" />} size="sm" variant="outline">
              <Plus />
              {m.lists_new()}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div sx={listCardGridStyles.grid}>
          {data.data.slice(0, PREVIEW_COUNT).map((list) => (
            <ListCard key={list.id} list={list} showOwner={false} />
          ))}
        </div>
      )}
    </section>
  )
}

export function MyListsSkeleton() {
  return (
    <section sx={listsPageStyles.section}>
      <Skeleton sx={styles.skeletonTitle} />
      <div sx={listCardGridStyles.grid}>
        {range(0, 4).map((index) => (
          <ListCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}
