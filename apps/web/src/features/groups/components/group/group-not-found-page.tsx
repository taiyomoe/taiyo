import { Users } from "@taiyomoe/ui/components/icons"
import { NotFoundPage } from "@/components/boundaries/not-found-page"
import { m } from "@/paraglide/messages"

export function GroupNotFoundPage() {
  return (
    <NotFoundPage
      back={{ label: m.group_back(), to: "/groups" }}
      description={m.group_not_found_description()}
      icon={<Users />}
      title={m.group_not_found_title()}
    />
  )
}
