import { Button } from "react-aria-components"
import { useSidebar } from "./sidebar-context"

export const SidebarRail = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      className="-translate-x-1/2 -right-4 absolute inset-y-0 z-20 flex w-4 cursor-w-resize ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:transition hover:after:bg-emphasis group-data-[state=collapsed]:cursor-e-resize"
      onPress={toggleSidebar}
    />
  )
}
