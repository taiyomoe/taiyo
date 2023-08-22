import { auth } from "@taiyo/auth";

import { GuestDropdown } from "./dropdowns/GuestDropdown";
import { UserDropdown } from "./dropdowns/UserDropdown";

export const NavbarDropdown = async () => {
  const session = await auth();

  if (session?.user) {
    return <UserDropdown session={session} />;
  }

  return <GuestDropdown />;
};
