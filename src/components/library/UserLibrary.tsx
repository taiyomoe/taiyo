import { Button } from "@nextui-org/react";
import { LibraryIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import { UserLibrarySidebar } from "~/components/library/UserLibrarySidebar";
import { useLibraryStore } from "~/stores";

export const UserLibrary = () => {
  const { toggleSidebar } = useLibraryStore();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div>
      <Button
        className="bg-transparent"
        startContent={<LibraryIcon />}
        onClick={toggleSidebar}
        isIconOnly
      />
      <UserLibrarySidebar />
    </div>
  );
};
