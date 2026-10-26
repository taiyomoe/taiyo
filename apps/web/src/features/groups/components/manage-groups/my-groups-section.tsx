import { Users } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Link } from "@tanstack/react-router"
import type { MyGroup } from "@/features/groups/api/groups"
import { DashboardSection, ListCard } from "@/components/layout/dashboard-page"
import { MyGroupRow } from "@/features/groups/components/manage-groups/my-group-row"
import { m } from "@/paraglide/messages"

type MyGroupsSectionProps = {
  groups: MyGroup[]
}

export function MyGroupsSection({ groups }: MyGroupsSectionProps) {
  return (
    <DashboardSection title={m.my_groups_section()}>
      {groups.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{m.my_groups_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.my_groups_empty_description()}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to="/groups" />} variant="outline">
              {m.my_groups_find()}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ListCard>
          {groups.map((membership) => (
            <MyGroupRow key={membership.group.id} membership={membership} />
          ))}
        </ListCard>
      )}
    </DashboardSection>
  )
}
