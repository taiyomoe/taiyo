import { Button } from "@nextui-org/button"
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"
import { useSidebar } from "~/components/sidebar/sidebar-provider"

export const NavbarCollapseButton = () => {
  const { isMobile, open, openMobile, toggleSidebar } = useSidebar()
  const shouldOpen = isMobile ? !openMobile : !open

  return (
    <Button
      startContent={shouldOpen ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
      onPress={toggleSidebar}
      variant="light"
      isIconOnly
    />
  )
}
