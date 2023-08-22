"use server";

import { auth } from "@taiyo/auth";

import { GuestDropdown } from "./GuestDropdown";
import { UserDropdown } from "./UserDropdown";

export const NavbarDropdown = async () => {
  const session = await auth();

  if (session) {
    return <UserDropdown session={session} />;
  }

  return <GuestDropdown />;
};
