import { auth } from "@taiyomoe/auth"
import { Navbar } from "./Navbar"
import { GuestPopover } from "./popovers/GuestPopover"
import { UserPopover } from "./popovers/UserPopover"

export const NavbarAuth = async () => {
  const session = await auth()

  if (session?.user) {
    return <Navbar popover={<UserPopover session={session} />} />
  }

  return <Navbar popover={<GuestPopover />} />
}
