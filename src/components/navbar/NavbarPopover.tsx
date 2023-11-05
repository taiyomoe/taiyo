import type { Session } from "next-auth";

import { GuestPopover } from "./popovers/GuestPopover";
import { UserPopover } from "./popovers/UserPopover";

type Props = { session: Session };

export const NavbarPopover = ({ session }: Props) => {
  if (session?.user) {
    return <UserPopover session={session} />;
  }

  return <GuestPopover />;
};
