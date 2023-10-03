import NextLink from "next/link";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { UserIcon } from "lucide-react";

import { NavbarPopoversCommonOptions } from "./NavbarPopoversCommonOptions";

export const GuestPopover = () => {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button isIconOnly>
          <UserIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-6">
        <div className="flex flex-col gap-4 bg-opacity-50">
          <NavbarPopoversCommonOptions />
          <Divider />
          <div>
            <Button
              as={NextLink}
              href="/auth/sign-in"
              className="text-medium z-10 min-w-[220px] font-medium text-primary-foreground"
              color="primary"
            >
              Logar
            </Button>
            <Button
              className="absolute inset-x-0 z-0 mx-4 p-0 opacity-30 blur-lg saturate-150 filter"
              color="primary"
            ></Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
