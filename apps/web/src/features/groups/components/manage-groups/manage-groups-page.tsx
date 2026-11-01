import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { DashboardPage } from "@/components/layout/dashboard-page"
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
  const { data: groups } = useSuspenseQuery(myGroupsQueryOptions)
  const { data: claims } = useSuspenseQuery(myOwnershipRequestsQueryOptions)
  const { data: creations } = useSuspenseQuery(myGroupCreationRequestsQueryOptions)

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
      <MyGroupsSection groups={groups} />
      <MyRequestsSection claims={claims} creations={creations} />
    </DashboardPage>
  )
}
