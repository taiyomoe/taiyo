import { Button } from "@nextui-org/react";
import { useSetAtom } from "jotai";
import { LibraryIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import { userLibarySidebarStateAtom } from "~/atoms/userLibrary.atoms";
import { UserLibrarySidebar } from "~/components/library/UserLibrarySidebar";

export const UserLibrary = () => {
  const { data: session } = useSession();
  const setSidebarState = useSetAtom(userLibarySidebarStateAtom);

  if (!session) return null;

  const handleClick = () => {
    setSidebarState((state) => (state === "show" ? "hide" : "show"));
  };

  return (
    <div>
      <Button
        className="bg-transparent"
        startContent={<LibraryIcon />}
        onClick={handleClick}
        isIconOnly
      />
      <UserLibrarySidebar />
    </div>
  );
};
