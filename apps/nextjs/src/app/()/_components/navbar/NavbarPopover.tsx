import { auth } from "@taiyo/auth";

import { GuestPopover } from "./popovers/GuestPopover";
import { UserPopover } from "./popovers/UserPopover";

export const NavbarPopover = async () => {
  const session = await auth();

  if (session?.user) {
    return <UserPopover session={session} />;
  }

  return <GuestPopover />;
};
