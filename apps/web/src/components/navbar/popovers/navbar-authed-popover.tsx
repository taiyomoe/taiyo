import type { Session } from "@taiyomoe/auth/server"
import { NavbarGuestPopover } from "./navbar-guest-popover"
import { NavbarUserPopover } from "./navbar-user-popover"

type Props = {
  session: Session | null
}

export const NavbarAuthedPopover = ({ session }: Props) => {
  if (session) {
    return <NavbarUserPopover session={session} />
  }

  return <NavbarGuestPopover />
}
