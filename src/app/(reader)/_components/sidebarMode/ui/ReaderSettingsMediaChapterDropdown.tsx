"use client";

import Link from "next/link";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Skeleton } from "@nextui-org/react";
import { useAtomValue } from "jotai";
import { ChevronsUpDownIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";
import { BackButton } from "~/components/generics/buttons/BackButton";
import { ForwardButton } from "~/components/generics/buttons/ForwardButton";
import { MediaChapterUtils } from "~/utils/MediaChapterUtils";

const readerSettingsMediaChapterDropdown = tv({
  slots: {
    container: "flex w-full gap-2",
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
  const { container, triggerButton, skeleton, dropdownBase, dropdownMenu } =
    readerSettingsMediaChapterDropdown({
      scollable: false,
    });

  return (
    <div className={container()}>
      <BackButton
        as={Link}
        href={
          chapter?.previousChapter
            ? MediaChapterUtils.getUrl(chapter?.previousChapter)
            : "https://google.com/"
        }
        isDisabled={!chapter?.previousChapter}
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
                as={Link}
                href={MediaChapterUtils.getUrl(_)}
                key={`chapter-${_.number}`}
                textValue={`Capítulo ${_.number}`}
              >
                Capítulo {_.number}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      )}
      <ForwardButton
        as={Link}
        href={
          chapter?.nextChapter
            ? MediaChapterUtils.getUrl(chapter?.nextChapter)
            : "https://google.com/"
        }
        isDisabled={!chapter?.nextChapter}
      />
    </div>
  );
};
