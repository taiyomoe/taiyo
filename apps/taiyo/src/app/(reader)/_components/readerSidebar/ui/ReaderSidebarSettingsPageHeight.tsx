"use client"

import { Button, ButtonGroup } from "@nextui-org/button"
import { tv } from "@nextui-org/react"
import { FoldVerticalIcon, UnfoldVerticalIcon } from "lucide-react"
import { useReaderSettingsStore } from "~/stores"

const readerSidebarSettingsPageHeight = tv({
  slots: {
    container: "flex flex-col gap-2",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
})

export const ReaderSidebarSettingsPageHeight = () => {
  const { page, update } = useReaderSettingsStore()

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsPageHeight()

  return (
    <div className={container()}>
      <p className={text()}>Altura das páginas</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<FoldVerticalIcon size={20} />}
          onPress={() => update("page.height", "fit", true)}
          color={page.height === "fit" ? "primary" : "default"}
          isDisabled={page.mode === "longstrip"}
          radius="sm"
        >
          Limitada
        </Button>
        <Button
          className={rightButton()}
          endContent={<UnfoldVerticalIcon size={20} />}
          onPress={() => update("page.height", "full", true)}
          color={page.height === "full" ? "primary" : "default"}
          isDisabled={page.mode === "longstrip"}
          radius="sm"
        >
          Livre
        </Button>
      </ButtonGroup>
    </div>
  )
}
