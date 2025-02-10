import { getSession } from "~/utils/get-session"
import { NavbarClient, type NavbarProps } from "./navbar-client"

export const Navbar = async (props: NavbarProps) => {
  const session = await getSession()

  return <NavbarClient {...props} session={session} />
}
