import { Button } from "@nextui-org/react";
import { LibraryIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import { UserLibrarySidebar } from "~/components/library/UserLibrarySidebar";
import { useLibraryStore, useReaderStore } from "~/stores";

export const UserLibrary = () => {
  const { settings, updateSettings } = useReaderStore();
  const { toggleSidebar } = useLibraryStore();
  const { data: session } = useSession();

  if (!session) return null;

  const handlePress = () => {
    toggleSidebar();

    if (settings.sidebar.state === "show") {
      updateSettings("sidebar.state", "hide");
    }
  };

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
  );
};
