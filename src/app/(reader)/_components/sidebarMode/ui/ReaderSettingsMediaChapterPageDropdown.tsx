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
import { useReaderStore } from "~/stores";

const readerSettingsMediaChapterPageDropdown = tv({
  slots: {
    container: "flex w-full gap-2",
    triggerButton: "h-full justify-between py-2 pr-2",
    skeleton: "h-[52px] w-full rounded-lg",
    dropdownBase: "rounded-r-none p-0",
    dropdownMenu:
      "scrollbar-track-content3 scrollbar-thumb-rounded-none max-h-[300px] overflow-y-scroll p-2 scrollbar-thin scrollbar-thumb-primary",
    textContainer: "flex flex-col text-left",
    textDescription: "text-default-500 text-xs",
  },
});

export const ReaderSettingsMediaChapterPageDropdown = () => {
  const { chapter, currentPageNumber, hasPreviousPage, hasNextPage } =
    useReaderStore();
  const { goBack, goForward, goTo } = useChapterNavigation();

  const slots = readerSettingsMediaChapterPageDropdown();

  if (!chapter || !currentPageNumber) {
    return <Skeleton className={slots.skeleton()} />;
  }

  return (
    <div className={slots.container()}>
      <BackButton onPress={goBack} isDisabled={!hasPreviousPage} />
      <Dropdown classNames={{ content: slots.dropdownBase() }}>
        <DropdownTrigger>
          <Button
            className={slots.triggerButton()}
            radius="sm"
            fullWidth
            endContent={<ChevronsUpDownIcon size={20} />}
          >
            <div className={slots.textContainer()}>
              <p>Página {currentPageNumber}</p>
              <p className={slots.textDescription()}>
                {currentPageNumber}/{chapter.pages.length}
              </p>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          className={slots.dropdownMenu()}
          disabledKeys={[`page-${currentPageNumber}`]}
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
