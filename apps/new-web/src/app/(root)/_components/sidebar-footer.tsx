import { useSession } from "~/stores/auth.store"
import { SidebarAuthedFooter } from "./sidebar-authed-footer"
import { SidebarUnauthedFooter } from "./sidebar-unauthed-footer"

export const SidebarFooter = () => {
  const session = useSession()

  return (
    <div className="absolute bottom-0 w-full border-subtle border-t p-4 transition-[padding] duration-300 group-data-[state=collapsed]:p-2">
      {session && <SidebarAuthedFooter />}
      {!session && <SidebarUnauthedFooter />}
    </div>
  )
}
