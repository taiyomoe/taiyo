import { Button } from "@nextui-org/button"
import { Divider } from "@nextui-org/divider"
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover"
import { GaugeIcon, LinkIcon } from "lucide-react"
import type { Session } from "next-auth"
import Image from "next/image"
import Link from "next/link"
import { SignOutButton } from "~/components/auth/SignOutButton"
import { SignedIn } from "~/components/utils/signed-in/client"
import { NavbarPopoverCommon } from "./navbar-popover-common"

type Props = { session: Session }

export const NavbarUserPopover = ({ session }: Props) => (
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
          as={Link}
          href={`/user/${session.user.id}`}
          className="justify-end gap-3 p-2 font-medium text-medium"
          endContent={<LinkIcon />}
          variant="light"
        >
          Meu perfil
        </Button>
        <SignedIn requiredRole="ADMIN">
          <Button
            as={Link}
            href={"/dashboard"}
            className="justify-end gap-3 p-2 font-medium text-medium"
            endContent={<GaugeIcon />}
            variant="light"
            color="warning"
          >
            Dashboard
          </Button>
        </SignedIn>
        <Divider />
        <NavbarPopoverCommon />
        <Divider />
        <SignOutButton />
      </div>
    </PopoverContent>
  </Popover>
)
