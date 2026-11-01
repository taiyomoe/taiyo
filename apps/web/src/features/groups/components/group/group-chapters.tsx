// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { PagePagination } from "@/components/pagination/page-pagination"
import { LatestList } from "@/features/chapters/components/latest-updates/latest-list"
import { groupChaptersQueryOptions } from "@/features/groups/api/groups"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const GROUP_CHAPTERS_PER_PAGE = 20

export function GroupChapters({ groupId, page }: { groupId: string; page: number }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const navigate = useNavigate({ from: "/groups/$groupId" })
  const { data } = useSuspenseQuery(
    groupChaptersQueryOptions(groupId, contentRatings, page, GROUP_CHAPTERS_PER_PAGE),
  )

  if (data.data.length === 0) {
    return <p sx={groupStyles.note}>{m.group_chapters_empty()}</p>
  }

  return (
    <>
      <LatestList chapters={data.data} />
      <PagePagination
        onJump={(target) => {
          void navigate({ search: { page: target === 1 ? undefined : target } })
        }}
        page={page}
        pageCount={Math.ceil(data.meta.total / GROUP_CHAPTERS_PER_PAGE)}
        renderLink={(target) => (
          <Link
            params={{ groupId }}
            search={{ page: target === 1 ? undefined : target }}
            to="/groups/$groupId"
          />
        )}
      />
    </>
  )
}
