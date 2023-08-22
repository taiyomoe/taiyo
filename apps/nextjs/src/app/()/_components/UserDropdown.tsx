"use client";

import Image from "next/image";

import type { Session } from "@taiyo/auth";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";

type Props = { session: Session };

export const UserDropdown = ({ session }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src={session.user.image ?? ""}
          width={40}
          height={40}
          alt="user's profile picture"
        />
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
};
