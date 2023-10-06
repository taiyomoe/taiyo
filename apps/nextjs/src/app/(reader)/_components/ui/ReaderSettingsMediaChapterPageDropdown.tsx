"use client";

import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
} from "lucide-react";

export const ReaderSettingsMediaChapterPageDropdown = () => {
  return (
    <div className="flex w-full gap-2">
      <Button
        className="h-full"
        startContent={<ChevronLeftIcon size={20} />}
        radius="sm"
        size="sm"
        isIconOnly
      />
      <Dropdown>
        <DropdownTrigger>
          <Button
            className="h-full justify-between py-2 pr-2"
            radius="sm"
            fullWidth
            endContent={<ChevronsUpDownIcon size={20} />}
          >
            <div className="flex flex-col text-left">
              <p>Página 3</p>
              <p className="text-default-500 text-xs">1/20</p>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownItem>Item 2</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Button
        className="h-full"
        startContent={<ChevronRightIcon size={20} />}
        radius="sm"
        size="sm"
        isIconOnly
      />
    </div>
  );
};
