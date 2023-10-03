import { LogOutIcon } from "lucide-react";

import { auth } from "@taiyo/auth";

import { SignOut } from "~/components/auth/SignOut";
import { GuestPopover } from "./popovers/GuestPopover";
import { UserPopover } from "./popovers/UserPopover";

export const NavbarDropdown = async () => {
  const session = await auth();

  if (session?.user) {
    return (
      <UserPopover session={session}>
        <SignOut className="flex gap-2 text-destructive">
          <LogOutIcon size={20} />
          <p className="text-md font-medium">Sair</p>
        </SignOut>
      </UserPopover>
    );
  }

  return <GuestPopover />;
};
