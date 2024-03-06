"use client"

import { Button, ButtonGroup } from "@nextui-org/button"
import { PanelLeftOpenIcon, PanelRightOpenIcon } from "lucide-react"
import { tv } from "tailwind-variants"
import { useReaderSettingsStore } from "~/stores"

const readerSidebarSettingsSide = tv({
  slots: {
    container: "flex flex-col gap-2",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
})

export const ReaderSidebarSettingsSide = () => {
  const { sidebar, update } = useReaderSettingsStore()

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsSide()

  return (
    <div className={container()}>
      <p className={text()}>Lado da sidebar</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<PanelLeftOpenIcon size={20} />}
          onPress={() => update("sidebar.side", "left", true)}
          color={sidebar.side === "left" ? "primary" : "default"}
          radius="sm"
        >
          Esquerda
        </Button>
        <Button
          className={rightButton()}
          endContent={<PanelRightOpenIcon size={20} />}
          onPress={() => update("sidebar.side", "right", true)}
          color={sidebar.side === "right" ? "primary" : "default"}
          radius="sm"
        >
          Direita
        </Button>
      </ButtonGroup>
    </div>
  )
}
