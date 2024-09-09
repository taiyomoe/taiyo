"use client"

import { Button } from "@nextui-org/button"
import { tv } from "@nextui-org/react"
import { SidebarIcon } from "~/components/icons/SidebarIcon"
import { useReaderSettingsStore } from "~/stores"
import { ReaderSidebarMediaTitle } from "./ReaderSidebarMediaTitle"

const readerSidebarHeader = tv({
  slots: {
    container: "flex w-full items-center gap-2",
    text: "font-semibold text-lg",
    icon: "",
  },
  variants: {
    side: {
      left: {
        container: "flex-row-reverse justify-end",
      },
      right: {
        container: "justify-between",
      },
    },
  },
})

export const ReaderSidebarHeader = () => {
  const { sidebar, update } = useReaderSettingsStore()

  const slots = readerSidebarHeader({ side: sidebar.side })

  const handlePress = () => {
    update("sidebar.state", sidebar.state === "show" ? "hide" : "show")
  }

  return (
    <div className={slots.container()}>
      <ReaderSidebarMediaTitle className={slots.text()} />
      <Button
        startContent={
          <SidebarIcon action="close" side={sidebar.side} size={20} />
        }
        onPress={handlePress}
        size="sm"
        isIconOnly
      />
    </div>
  )
}
