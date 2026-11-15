import { Search } from "@taiyomoe/ui/components/icons"
import { NotFoundContent } from "@/components/boundaries/not-found-page"
import { m } from "@/paraglide/messages"

export function SuggestionNotFound() {
  return (
    <NotFoundContent
      back={{ label: m.suggestion_back(), to: "/dashboard/suggestions" }}
      description={m.suggestion_not_found_description()}
      icon={<Search />}
      title={m.suggestion_not_found_title()}
    />
  )
}
