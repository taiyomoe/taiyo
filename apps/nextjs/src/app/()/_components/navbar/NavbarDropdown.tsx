"use server";

import { LogOutIcon } from "lucide-react";

import { auth } from "@taiyo/auth";

import { SignOut } from "~/components/auth/SignOut";
import { GuestDropdown } from "./dropdowns/GuestDropdown";
import { UserDropdown } from "./dropdowns/UserDropdown";

export const NavbarDropdown = async () => {
  const session = await auth();

  if (session?.user) {
    return (
      <UserDropdown session={session}>
        <SignOut className="flex gap-2 text-destructive">
          <LogOutIcon size={20} />
          <p className="text-md font-medium">Sair</p>
        </SignOut>
      </UserDropdown>
    );
  }

  return <GuestDropdown />;
};
