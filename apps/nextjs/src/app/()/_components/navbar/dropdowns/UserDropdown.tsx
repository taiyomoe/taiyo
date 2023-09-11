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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";

type Props = { session: Session; children: JSX.Element };

export const UserDropdown = ({ session, children }: Props) => {
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
      <DropdownMenuContent align="end" alignOffset={-16}>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={"/profile/" + session.user.id} className="flex gap-2">
              <User size={20} />
              <p className="text-md font-medium">Perfil</p>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings" className="flex gap-2">
              <SettingsIcon size={20} />
              <p className="text-md font-medium">Parâmetros</p>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-destructive-foreground">
            {children}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
