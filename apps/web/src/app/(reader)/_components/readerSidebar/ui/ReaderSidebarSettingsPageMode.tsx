"use client"

import { Button, ButtonGroup } from "@nextui-org/button"
import { tv } from "@nextui-org/react"
import type { ReaderSettings } from "@taiyomoe/types"
import { FileIcon, ScrollTextIcon } from "lucide-react"
import { useReaderSettingsStore } from "~/stores"

const readerSidebarSettingsPageMode = tv({
  slots: {
    container: "flex flex-col items-end gap-2",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
})

export const ReaderSidebarSettingsPageMode = () => {
  const { page, update, reset } = useReaderSettingsStore()

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsPageMode()

  const handlePress = (mode: ReaderSettings["page"]["mode"]) => () => {
    if (mode === "single") {
      update("page.mode", "single", true)
      reset("page.height")
      reset("page.width")

      return
    }

    update("page.mode", "longstrip", true)
    update("page.height", "full")
    update("page.width", "fit")
  }

  return (
    <div className={container()}>
      <p className={text()}>Páginas</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<FileIcon size={20} />}
          onPress={handlePress("single")}
          color={page.mode === "single" ? "primary" : "default"}
          radius="sm"
        >
          Única
        </Button>
        <Button
          className={rightButton()}
          endContent={<ScrollTextIcon size={20} />}
          onPress={handlePress("longstrip")}
          color={page.mode === "longstrip" ? "primary" : "default"}
          radius="sm"
        >
          Cascata
        </Button>
      </ButtonGroup>
    </div>
  )
}
