import { Users } from "@taiyomoe/ui/components/icons"
import { NotFoundContent } from "@/components/boundaries/not-found-page"
import { m } from "@/paraglide/messages"

export function ManageGroupNotFound() {
  return (
    <NotFoundContent
      back={{ label: m.manage_group_back(), to: "/dashboard/groups" }}
      description={m.group_not_found_description()}
      icon={<Users />}
      title={m.group_not_found_title()}
    />
  )
}
