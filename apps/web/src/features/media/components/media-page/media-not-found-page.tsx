import { Book } from "@taiyomoe/ui/components/icons"
import { NotFoundPage } from "@/components/boundaries/not-found-page"
import { m } from "@/paraglide/messages"

export function MediaNotFoundPage() {
  return (
    <NotFoundPage
      back={{ label: m.media_back(), to: "/titles" }}
      description={m.media_not_found_description()}
      icon={<Book />}
      title={m.media_not_found_title()}
    />
  )
}
