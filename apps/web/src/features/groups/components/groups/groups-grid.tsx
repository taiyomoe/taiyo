// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Users } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { PagePagination } from "@/components/pagination/page-pagination"
import { GROUPS_PER_PAGE, groupsQueryOptions } from "@/features/groups/api/groups"
import { GroupCard } from "@/features/groups/components/groups/group-card"
import { groupsStyles } from "@/features/groups/components/groups/groups-styles"
import { m } from "@/paraglide/messages"

export function GroupsGrid({ search, page }: { search: string | undefined; page: number }) {
  const navigate = useNavigate({ from: "/groups/" })
  const { data } = useSuspenseQuery(groupsQueryOptions({ page, search }))
  const pageCount = Math.ceil(data.meta.total / GROUPS_PER_PAGE)

  if (data.data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>{m.groups_empty_title()}</EmptyTitle>
          <EmptyDescription>{m.groups_empty_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div sx={groupsStyles.grid}>
        {data.data.map((group) => (
          <GroupCard group={group} key={group.id} />
        ))}
      </div>
      <PagePagination
        onJump={(target) => {
          void navigate({
            search: (prev) => ({ ...prev, page: target === 1 ? undefined : target }),
          })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => (
          <Link
            search={(prev) => ({ ...prev, page: target === 1 ? undefined : target })}
            to="/groups"
          />
        )}
      />
    </>
  )
}
