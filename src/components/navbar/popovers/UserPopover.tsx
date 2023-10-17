import Image from "next/image";
import NextLink from "next/link";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { GaugeIcon, LinkIcon } from "lucide-react";
import { type Session } from "next-auth";

import { SignOut } from "~/components/auth/SignOut";
import { SignedIn } from "~/components/utils/SignedIn";
import { NavbarPopoversCommonOptions } from "./NavbarPopoversCommonOptions";

type Props = { session: Session };

export const UserPopover = ({ session }: Props) => {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Image
          className="cursor-pointer rounded-full"
          src={session.user.image ?? "https://i.imgur.com/w7IkYwl.png"}
          width={40}
          height={40}
          alt="user's profile picture"
        />
      </PopoverTrigger>
      <PopoverContent className="p-6">
        <div className="flex flex-col gap-4">
          <Button
            as={NextLink}
            href={`/user/${session.user.id}`}
            className="justify-end gap-3 p-2 text-medium font-medium"
            endContent={<LinkIcon />}
            variant="light"
            isDisabled
          >
            Meu perfil
          </Button>
          <SignedIn allowIfUserHasAtLeastOnePermission>
            <Button
              as={NextLink}
              href={`/dashboard`}
              className="justify-end gap-3 p-2 text-medium font-medium"
              endContent={<GaugeIcon />}
              variant="light"
              color="warning"
            >
              Dashboard
            </Button>
          </SignedIn>
          <Divider />
          <NavbarPopoversCommonOptions />
          <Divider />
          <SignOut
            classNames={{ button: "min-w-[220px] font-medium text-medium" }}
            variant="flat"
            color="danger"
          >
            <p>Sair</p>
          </SignOut>
        </div>
      </PopoverContent>
    </Popover>
  );
};
