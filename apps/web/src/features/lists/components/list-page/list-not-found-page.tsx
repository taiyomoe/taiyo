import { List } from "@taiyomoe/ui/components/icons"
import { NotFoundPage } from "@/components/boundaries/not-found-page"
import { m } from "@/paraglide/messages"

export function ListNotFoundPage() {
  return (
    <NotFoundPage
      back={{ label: m.list_back(), to: "/lists" }}
      description={m.list_not_found_description()}
      icon={<List />}
      title={m.list_not_found_title()}
    />
  )
}
