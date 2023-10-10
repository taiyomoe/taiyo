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

import {
  mediaChapterAtom,
  mediaChapterNavigationAtom,
} from "~/atoms/mediaChapter.atoms";

const readerSettingsMediaChapterPageDropdown = tv({
  slots: {
    container: "flex w-full gap-2",
    navigationButton: "h-auto",
    triggerButton: "h-full justify-between py-2 pr-2",
    skeleton: "h-[52px] w-full rounded-lg",
    dropdownBase: "",
    dropdownMenu: "",
    textContainer: "flex flex-col text-left",
    textDescription: "text-default-500 text-xs",
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

export const ReaderSettingsMediaChapterPageDropdown = () => {
  const chapter = useAtomValue(mediaChapterAtom);
  const chapterNavigation = useAtomValue(mediaChapterNavigationAtom);

  const {
    container,
    navigationButton,
    triggerButton,
    skeleton,
    dropdownBase,
    dropdownMenu,
    textContainer,
    textDescription,
  } = readerSettingsMediaChapterPageDropdown({
    scollable: (chapter && chapter.pages.length > 9) ?? false,
  });

  if (!chapter || !chapterNavigation) {
    return <Skeleton className={skeleton()} />;
  }

  return (
    <div className={container()}>
      <Button
        className={navigationButton()}
        startContent={<ChevronLeftIcon size={20} />}
        // onPress={() => handlePageChange("back")}
        isDisabled={!chapterNavigation.previousPage}
        radius="sm"
        size="sm"
        isIconOnly
      />
      <Dropdown classNames={{ base: dropdownBase() }}>
        <DropdownTrigger>
          <Button
            className={triggerButton()}
            radius="sm"
            fullWidth
            endContent={<ChevronsUpDownIcon size={20} />}
          >
            <div className={textContainer()}>
              <p>Página {chapterNavigation.currentPage}</p>
              <p className={textDescription()}>
                {chapterNavigation.currentPage}/{chapter.pages.length}
              </p>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          className={dropdownMenu()}
          disabledKeys={[`page-${chapterNavigation.currentPage - 1}`]}
          selectionMode="single"
          aria-label="Páginas"
        >
          {chapter.pages.map((_, i) => (
            <DropdownItem key={"page-" + i} textValue={`Página ${i + 1}`}>
              Página {i + 1}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Button
        className={navigationButton()}
        startContent={<ChevronRightIcon size={20} />}
        // onPress={() => handlePageChange("next")}
        isDisabled={!chapterNavigation.nextPage}
        radius="sm"
        size="sm"
        isIconOnly
      />
    </div>
  );
};
