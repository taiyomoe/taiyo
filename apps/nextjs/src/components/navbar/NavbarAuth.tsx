import { auth } from "@taiyo/auth";

import { Navbar } from "./Navbar";
import { GuestPopover } from "./popovers/GuestPopover";
import { UserPopover } from "./popovers/UserPopover";

export const NavbarAuth = async () => {
  const session = await auth();
  const popover = session?.user ? (
    <UserPopover session={session} />
  ) : (
    <GuestPopover />
  );

  return <Navbar popover={popover} />;
};
