"use client"

import { Button, ButtonGroup } from "@nextui-org/button"
import { FoldHorizontalIcon, UnfoldHorizontalIcon } from "lucide-react"
import { tv } from "tailwind-variants"
import { useReaderSettingsStore } from "~/stores"

const readerSidebarSettingsPageWidth = tv({
  slots: {
    container: "flex flex-col gap-2 items-end",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
})

export const ReaderSidebarSettingsPageWidth = () => {
  const { page, update } = useReaderSettingsStore()

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsPageWidth()

  return (
    <div className={container()}>
      <p className={text()}>Largura das páginas</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<FoldHorizontalIcon size={20} />}
          onPress={() => update("page.width", "fit", true)}
          color={page.width === "fit" ? "primary" : "default"}
          isDisabled={page.mode === "longstrip"}
          radius="sm"
        >
          Limitada
        </Button>
        <Button
          className={rightButton()}
          endContent={<UnfoldHorizontalIcon size={20} />}
          onPress={() => update("page.width", "full", true)}
          color={page.width === "full" ? "primary" : "default"}
          isDisabled={page.mode === "longstrip"}
          radius="sm"
        >
          Livre
        </Button>
      </ButtonGroup>
    </div>
  )
}
