"use client"

import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { Skeleton } from "@nextui-org/react"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { ChevronsUpDownIcon } from "lucide-react"
import Link from "next/link"
import { tv } from "tailwind-variants"
import { BackButton } from "~/components/generics/buttons/BackButton"
import { ForwardButton } from "~/components/generics/buttons/ForwardButton"
import { useChapterProgression } from "~/hooks/useChapterProgression"
import { useReaderStore } from "~/stores"

const readerSettingsMediaChapterDropdown = tv({
  slots: {
    container: "flex w-full gap-2 md:max-w-readerSidebar",
    triggerButton: "chapter-number h-full justify-between py-2 pr-2",
    skeleton: "h-9 w-full rounded-lg",
    dropdownBase: "rounded-r-none p-0",
    dropdownMenu:
      "scrollbar-track-content3 scrollbar-thumb-rounded-none max-h-[300px] overflow-y-scroll p-2 scrollbar-thin scrollbar-thumb-primary",
  },
})

export const ReaderSettingsMediaChapterDropdown = () => {
  const { chapter } = useReaderStore()
  const slots = readerSettingsMediaChapterDropdown()
  const { onNextChapter } = useChapterProgression()

  const backButtonUrl = chapter?.previousChapter
    ? MediaChapterUtils.getUrl(chapter?.previousChapter)
    : "https://google.com/"

  const forwardButtonUrl = chapter?.nextChapter
    ? MediaChapterUtils.getUrl(chapter?.nextChapter)
    : "https://google.com/"

  return (
    <div className={slots.container()}>
      <BackButton
        as={Link}
        href={backButtonUrl}
        isDisabled={!chapter?.previousChapter}
      />
      {!chapter && <Skeleton className={slots.skeleton()} />}
      {chapter && (
        <Dropdown classNames={{ content: slots.dropdownBase() }}>
          <DropdownTrigger>
            <Button
              className={slots.triggerButton()}
              endContent={<ChevronsUpDownIcon size={20} />}
              radius="sm"
              fullWidth
            >
              Capítulo {chapter.number}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            className={slots.dropdownMenu()}
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
        href={forwardButtonUrl}
        isDisabled={!chapter?.nextChapter}
        onPress={() => onNextChapter()}
      />
    </div>
  )
}
