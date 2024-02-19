"use client"

import { Button, ButtonGroup } from "@nextui-org/button"
import { MousePointer2Icon } from "lucide-react"
import { tv } from "tailwind-variants"
import { SidebarIcon } from "~/components/icons/SidebarIcon"
import { useDevice } from "~/hooks/useDevice"
import { useReaderSettingsStore } from "~/stores"

const readerSidebarSettingsOpenMode = tv({
  slots: {
    container: "hidden md:flex flex-col gap-2 items-end",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
})

export const ReaderSidebarSettingsOpenMode = () => {
  const { sidebar, update } = useReaderSettingsStore()
  const device = useDevice()

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsOpenMode()

  return (
    <div className={container()}>
      <p className={text()}>Modo de abrir a sidebar</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={
            <SidebarIcon action="open" side={sidebar.side} size={20} />
          }
          onPress={() => update("sidebar.openMode", "button", true)}
          color={sidebar.openMode === "button" ? "primary" : "default"}
          isDisabled={!device?.isAboveTablet}
          radius="sm"
        >
          Botão
        </Button>
        <Button
          className={rightButton()}
          endContent={<MousePointer2Icon size={20} />}
          onPress={() => update("sidebar.openMode", "hover", true)}
          color={sidebar.openMode === "hover" ? "primary" : "default"}
          isDisabled={!device?.isAboveTablet}
          radius="sm"
        >
          Foco
        </Button>
      </ButtonGroup>
    </div>
  )
}
