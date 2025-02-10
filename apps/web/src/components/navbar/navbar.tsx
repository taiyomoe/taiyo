import { getSession } from "~/utils/get-session"
import { NavbarClient, type NavbarProps } from "./navbar-client"

export const Navbar = async (props: Omit<NavbarProps, "session">) => {
  const session = await getSession()

  return <NavbarClient {...props} session={session} />
}
