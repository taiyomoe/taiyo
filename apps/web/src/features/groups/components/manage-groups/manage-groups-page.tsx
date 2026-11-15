import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { DashboardPage, DashboardSection } from "@/components/layout/dashboard-page"
import { ListCardSkeleton } from "@/components/layout/list-card-skeleton"
import {
  myGroupCreationRequestsQueryOptions,
  myGroupsQueryOptions,
  myOwnershipRequestsQueryOptions,
} from "@/features/groups/api/groups"
import { MyGroupsSection } from "@/features/groups/components/manage-groups/my-groups-section"
import { MyRequestsSection } from "@/features/groups/components/manage-groups/my-requests-section"
import { RequestGroupDialog } from "@/features/groups/components/manage-groups/request-group-dialog"
import { m } from "@/paraglide/messages"

export function ManageGroupsPage() {
  return (
    <DashboardPage
      actions={
        <>
          <Button render={<Link to="/groups" />} variant="outline">
            <Search />
            {m.my_groups_find()}
          </Button>
          <RequestGroupDialog />
        </>
      }
      subtitle={m.my_groups_subtitle()}
      title={m.my_groups_title()}
    >
      <Suspense
        fallback={
          <DashboardSection title={m.my_groups_section()}>
            <ListCardSkeleton actions={["5rem"]} media="group" rows={2} />
          </DashboardSection>
        }
      >
        <ManageGroupsContent />
      </Suspense>
    </DashboardPage>
  )
}

function ManageGroupsContent() {
  const { data: groups } = useSuspenseQuery(myGroupsQueryOptions)
  const { data: claims } = useSuspenseQuery(myOwnershipRequestsQueryOptions)
  const { data: creations } = useSuspenseQuery(myGroupCreationRequestsQueryOptions)

  return (
    <>
      <MyGroupsSection groups={groups} />
      <MyRequestsSection claims={claims} creations={creations} />
    </>
  )
}
