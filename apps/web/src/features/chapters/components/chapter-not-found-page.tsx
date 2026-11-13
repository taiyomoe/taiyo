import { Book } from "@taiyomoe/ui/components/icons"
import { NotFoundPage } from "@/components/boundaries/not-found-page"
import { m } from "@/paraglide/messages"

export function ChapterNotFoundPage() {
  return (
    <NotFoundPage
      back={{ label: m.not_found_back_home(), to: "/" }}
      description={m.chapter_not_found_description()}
      icon={<Book />}
      title={m.chapter_not_found_title()}
    />
  )
}
