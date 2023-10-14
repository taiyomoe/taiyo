import type { Session } from "@taiyo/auth";

import { GuestPopover } from "./popovers/GuestPopover";
import { UserPopover } from "./popovers/UserPopover";

type Props = { session: Session };

export const NavbarPopover = ({ session }: Props) => {
  if (session?.user) {
    return <UserPopover session={session} />;
  }

  return <GuestPopover />;
};
