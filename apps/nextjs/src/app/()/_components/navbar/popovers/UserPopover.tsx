"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import { SettingsIcon, User } from "lucide-react";

import type { Session } from "@taiyo/auth";

type Props = { session: Session; children: JSX.Element };

export const UserPopover = ({ session, children }: Props) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Image
          className="cursor-pointer rounded-full"
          src={session.user.image ?? "https://i.imgur.com/w7IkYwl.png"}
          width={40}
          height={40}
          alt="user's profile picture"
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection>
          <DropdownItem>
            <Link href={"/profile/" + session.user.id} className="flex gap-2">
              <User size={20} />
              <p className="text-md font-medium">Perfil</p>
            </Link>
          </DropdownItem>
          <DropdownItem>
            <Link href="/settings" className="flex gap-2">
              <SettingsIcon size={20} />
              <p className="text-md font-medium">Parâmetros</p>
            </Link>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem className="hover:bg-danger-foreground">
            {children}
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
