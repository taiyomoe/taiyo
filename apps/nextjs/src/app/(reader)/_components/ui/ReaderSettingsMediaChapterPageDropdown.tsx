"use client";

import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Skeleton } from "@nextui-org/react";
import { useAtomValue } from "jotai";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
} from "lucide-react";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";

export const ReaderSettingsMediaChapterPageDropdown = () => {
  const chapter = useAtomValue(mediaChapterAtom);

  return (
    <div className="flex w-full gap-2">
      <Button
        className="h-full"
        startContent={<ChevronLeftIcon size={20} />}
        isDisabled={!chapter}
        radius="sm"
        size="sm"
        isIconOnly
      />
      {!chapter && <Skeleton className="h-[52px] w-full rounded-lg" />}
      {chapter && (
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
          <DropdownMenu className="max-h-[300px] overflow-y-scroll">
            {chapter.pages.map((_, i) => (
              <DropdownItem key={i}>Página {i + 1}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      )}
      <Button
        className="h-full"
        startContent={<ChevronRightIcon size={20} />}
        isDisabled={!chapter}
        radius="sm"
        size="sm"
        isIconOnly
      />
    </div>
  );
};
