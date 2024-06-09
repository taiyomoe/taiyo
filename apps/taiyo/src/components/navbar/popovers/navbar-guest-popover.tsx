import { Button } from "@nextui-org/button"
import { Divider } from "@nextui-org/divider"
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover"
import { UserIcon } from "lucide-react"
import NextLink from "next/link"
import { NavbarPopoverCommon } from "./navbar-popover-common"

export const NavbarGuestPopover = () => (
  <Popover placement="bottom-end">
    <PopoverTrigger>
      <Button isIconOnly>
        <UserIcon />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="p-6">
      <div className="flex flex-col gap-4">
        <NavbarPopoverCommon />
        <Divider />
        <div>
          <Button
            as={NextLink}
            href="/auth/sign-in"
            className="z-10 min-w-[220px] font-medium text-medium text-primary-foreground"
            color="primary"
          >
            Login
          </Button>
          <Button
            className="absolute inset-x-0 z-0 mx-4 p-0 opacity-30 blur-lg saturate-150 filter"
            color="primary"
          />
        </div>
      </div>
    </PopoverContent>
  </Popover>
)
