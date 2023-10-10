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
import { tv } from "tailwind-variants";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";

const readerSettingsMediaChapterDropdown = tv({
  slots: {
    container: "flex w-full gap-2",
    navigationButton: "h-auto",
    triggerButton: "h-full justify-between py-2 pr-2",
    skeleton: "h-9 w-full rounded-lg",
    dropdownBase: "",
    dropdownMenu: "",
  },
  variants: {
    scollable: {
      true: {
        dropdownBase: "rounded-r-none p-0",
        dropdownMenu:
          "scrollbar-track-content3 scrollbar-thumb-rounded-md max-h-[300px] overflow-y-scroll p-2 scrollbar-thin scrollbar-thumb-primary",
      },
    },
  },
});

export const ReaderSettingsMediaChapterDropdown = () => {
  const chapter = useAtomValue(mediaChapterAtom);
  const {
    container,
    navigationButton,
    triggerButton,
    skeleton,
    dropdownBase,
    dropdownMenu,
  } = readerSettingsMediaChapterDropdown({
    scollable: false,
  });

  return (
    <div className={container()}>
      <Button
        className={navigationButton()}
        startContent={<ChevronLeftIcon size={20} />}
        isDisabled={!chapter?.previousChapter}
        radius="sm"
        size="sm"
        isIconOnly
      />
      {!chapter && <Skeleton className={skeleton()} />}
      {chapter && (
        <Dropdown classNames={{ base: dropdownBase() }}>
          <DropdownTrigger>
            <Button
              className={triggerButton()}
              endContent={<ChevronsUpDownIcon size={20} />}
              radius="sm"
              fullWidth
            >
              Capítulo {chapter.number}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            className={dropdownMenu()}
            disabledKeys={[`chapter-${chapter.number}`]}
            aria-label="Capítulos"
          >
            {chapter.media.chapters.map((_) => (
              <DropdownItem
                key={`chapter-${_.number}`}
                textValue={`Capítulo ${_.number}`}
              >
                Capítulo {_.number}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      )}
      <Button
        className={navigationButton()}
        startContent={<ChevronRightIcon size={20} />}
        isDisabled={!chapter?.nextChapter}
        radius="sm"
        size="sm"
        isIconOnly
      />
    </div>
  );
};
