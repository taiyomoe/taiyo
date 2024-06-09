"use client"

import { Button } from "@nextui-org/button"
import { usePathname } from "next/navigation"
import { SidebarIcon } from "~/components/icons/SidebarIcon"
import { useDevice } from "~/hooks/useDevice"
import { useReaderSettingsStore, useReaderStore } from "~/stores"

export const ReaderSidebarOpenButton = () => {
  const pathname = usePathname()
  const { chapter } = useReaderStore()
  const { sidebar, update } = useReaderSettingsStore()
  const { isAboveTablet } = useDevice()

  if (
    !pathname.includes("/chapter/") ||
    !chapter ||
    sidebar.openMode === "hover" ||
    (sidebar.state === "show" && isAboveTablet)
  ) {
    return null
  }

  return (
    <Button
      startContent={<SidebarIcon action="open" side={sidebar.side} />}
      onPress={() => update("sidebar.state", "show")}
      isIconOnly
    />
  )
}
