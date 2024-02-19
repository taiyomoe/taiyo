import { Button } from "@nextui-org/button"
import { SidebarIcon } from "~/components/icons/SidebarIcon"
import { useLibraryStore } from "~/stores"

export const UserLibrarySidebarTitle = () => {
  const { toggleSidebar } = useLibraryStore()

  return (
    <div className="flex items-center justify-between">
      <p className="text-xl font-semibold">Biblioteca</p>
      <Button
        startContent={<SidebarIcon action="close" side="right" size={20} />}
        onPress={toggleSidebar}
        size="sm"
        isIconOnly
      />
    </div>
  )
}
