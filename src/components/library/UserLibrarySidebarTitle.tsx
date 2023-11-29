import { Button } from "@nextui-org/button";
import { useSetAtom } from "jotai";

import { userLibarySidebarStateAtom } from "~/atoms/userLibrary.atoms";
import { SidebarIcon } from "~/components/icons/SidebarIcon";

export const UserLibrarySidebarTitle = () => {
  const setSidebarState = useSetAtom(userLibarySidebarStateAtom);

  const handleClick = () => {
    setSidebarState("hide");
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-xl font-semibold">Biblioteca</p>
      <Button
        startContent={<SidebarIcon action="close" side="right" />}
        onClick={handleClick}
        isIconOnly
      />
    </div>
  );
};
