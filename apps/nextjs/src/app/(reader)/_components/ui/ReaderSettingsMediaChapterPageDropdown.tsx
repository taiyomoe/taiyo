"use client";

import type { Key } from "react";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Skeleton } from "@nextui-org/react";
import { ChevronsUpDownIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { BackButton } from "~/components/generics/buttons/BackButton";
import { ForwardButton } from "~/components/generics/buttons/ForwardButton";
import { useChapterNavigation } from "~/hooks/useChapterNavigation";

const readerSettingsMediaChapterPageDropdown = tv({
  slots: {
    container: "flex w-full gap-2",
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
  const {
    chapter,
    currentPage,
    hasPreviousPage,
    hasNextPage,
    goBack,
    goForward,
    goTo,
  } = useChapterNavigation();

  const {
    container,
    triggerButton,
    skeleton,
    dropdownBase,
    dropdownMenu,
    textContainer,
    textDescription,
  } = readerSettingsMediaChapterPageDropdown({
    scollable: (chapter && chapter.pages.length > 9) ?? false,
  });

  if (!chapter || !currentPage) {
    return <Skeleton className={skeleton()} />;
  }

  return (
    <div className={container()}>
      <BackButton onPress={goBack} isDisabled={!hasPreviousPage} />
      <Dropdown classNames={{ base: dropdownBase() }}>
        <DropdownTrigger>
          <Button
            className={triggerButton()}
            radius="sm"
            fullWidth
            endContent={<ChevronsUpDownIcon size={20} />}
          >
            <div className={textContainer()}>
              <p>Página {currentPage}</p>
              <p className={textDescription()}>
                {currentPage}/{chapter.pages.length}
              </p>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          className={dropdownMenu()}
          disabledKeys={[`page-${currentPage}`]}
          selectionMode="single"
          aria-label="Páginas"
          onSelectionChange={(keys) => {
            (keys as Set<Key>).forEach((key) => {
              goTo(parseInt(key.toString().replace("page-", "")));
            });
          }}
        >
          {chapter.pages.map((_, i) => (
            <DropdownItem key={"page-" + (i + 1)} textValue={`Página ${i + 1}`}>
              Página {i + 1}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <ForwardButton onPress={goForward} isDisabled={!hasNextPage} />
    </div>
  );
};
