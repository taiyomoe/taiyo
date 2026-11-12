import * as stylex from "@stylexjs/stylex"
import { ThumbsUp } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { range } from "remeda"
import { PagePagination } from "@/components/pagination/page-pagination"
import { TOP_LISTS_PER_PAGE, topListsQueryOptions } from "@/features/lists/api/lists"
import { listsPageStyles } from "@/features/lists/components/lists-page/lists-page-styles"
import { TopListRow, TopListRowSkeleton } from "@/features/lists/components/lists-page/top-list-row"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  skeletonTitle: {
    borderRadius: radius.sm,
    height: "1.25rem",
    width: "7rem",
  },
})

export function TopListsSection({ page, viewerId }: { page: number; viewerId: string | null }) {
  const navigate = useNavigate({ from: "/lists/" })
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(topListsQueryOptions(page, contentRatings))
  const pageCount = Math.ceil(data.meta.total / TOP_LISTS_PER_PAGE)
  const toSearch = (target: number) => ({ page: target === 1 ? undefined : target })

  return (
    <section sx={listsPageStyles.section}>
      <div sx={listsPageStyles.sectionHeader}>
        <h2 sx={listsPageStyles.sectionTitle}>{m.lists_top_title()}</h2>
      </div>
      {data.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ThumbsUp />
            </EmptyMedia>
            <EmptyTitle>{m.lists_top_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.lists_top_empty_description()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol sx={listsPageStyles.rows}>
          {data.data.map((list, index) => (
            <TopListRow
              key={list.id}
              list={list}
              rank={(page - 1) * TOP_LISTS_PER_PAGE + index + 1}
              viewerId={viewerId}
            />
          ))}
        </ol>
      )}
      <PagePagination
        onJump={(target) => {
          void navigate({ search: toSearch(target) })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => <Link search={toSearch(target)} to="/lists" />}
      />
    </section>
  )
}

export function TopListsSkeleton() {
  return (
    <section sx={listsPageStyles.section}>
      <Skeleton sx={styles.skeletonTitle} />
      <ol sx={listsPageStyles.rows}>
        {range(0, 6).map((index) => (
          <TopListRowSkeleton key={index} />
        ))}
      </ol>
    </section>
  )
}
