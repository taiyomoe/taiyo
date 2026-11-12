import { User } from "@taiyomoe/ui/components/icons"
import { NotFoundPage } from "@/components/boundaries/not-found-page"
import { m } from "@/paraglide/messages"

export function ProfileNotFoundPage() {
  return (
    <NotFoundPage
      back={{ label: m.not_found_back_home(), to: "/" }}
      description={m.profile_not_found_description()}
      icon={<User />}
      title={m.profile_not_found_title()}
    />
  )
}
