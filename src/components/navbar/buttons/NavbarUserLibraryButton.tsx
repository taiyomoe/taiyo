import { Button } from "@nextui-org/react"
import { LibraryIcon } from "lucide-react"
import { useSession } from "next-auth/react"

import { UserLibrarySidebar } from "~/components/library/UserLibrarySidebar"
import { useLibraryStore, useReaderSettingsStore } from "~/stores"

export const NavbarUserLibraryButton = () => {
  const { sidebar, update } = useReaderSettingsStore()
  const { toggleSidebar } = useLibraryStore()
  const { data: session } = useSession()

  if (!session) return null

  const handlePress = () => {
    toggleSidebar()

    if (sidebar.state === "show") {
      update("sidebar.state", "hide")
    }
  }

  return (
    <div>
      <Button
        className="bg-transparent"
        startContent={<LibraryIcon />}
        onPress={handlePress}
        isIconOnly
      />
      <UserLibrarySidebar />
    </div>
  )
}
