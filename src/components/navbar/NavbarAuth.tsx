import { getServerAuthSession } from "~/lib/auth/utils";

import { Navbar } from "./Navbar";
import { GuestPopover } from "./popovers/GuestPopover";
import { UserPopover } from "./popovers/UserPopover";

export const NavbarAuth = async () => {
  const session = await getServerAuthSession();
  const popover = session?.user ? (
    <UserPopover session={session} />
  ) : (
    <GuestPopover />
  );

  return <Navbar popover={popover} />;
};
