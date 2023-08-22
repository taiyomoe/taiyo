"use client";

import Image from "next/image";
import Link from "next/link";
import { SettingsIcon, User } from "lucide-react";

import type { Session } from "@taiyo/auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";

type Props = { session: Session };

export const UserDropdown = ({ session }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          className="cursor-pointer rounded-full"
          src={session.user.image ?? "https://i.imgur.com/w7IkYwl.png"}
          width={40}
          height={40}
          alt="user's profile picture"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User size={16} />
            <Link href={"/profile/" + session.user.id}>Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon size={16} />
            <Link href="/settings">Parâmetros</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
