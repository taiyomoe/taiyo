import { tv } from "@nextui-org/react";
import { useAtomValue } from "jotai";

import { userLibarySidebarStateAtom } from "~/atoms/userLibrary.atoms";
import { UserLibrarySidebarTitle } from "~/components/library/UserLibrarySidebarTitle";
import { useDevice } from "~/hooks/useDevice";

const userLibrarySidebar = tv({
  slots: {
    container:
      "transition-all z-30 top-0 right-0 border-l-divider border-l -mr-readerSidebar aria-expanded:mr-0",
    contentWrapper:
      "bg-content1 w-[calc(var(--library-sidebar-width)-1px)] max-w-[calc(var(--library-sidebar-width)-1px)] right-[unset] width-[unset] flex flex-col gap-2 p-4 overflow-x-hidden overflow-y-auto top-0 max-h-screen h-screen sticky",
  },
  variants: {
    isMobile: {
      true: {
        container: "fixed shadow-xl right-0",
      },
      false: {
        container: "fixed",
      },
    },
  },
});

export const UserLibrarySidebar = () => {
  const sidebarState = useAtomValue(userLibarySidebarStateAtom);
  const { isMobile } = useDevice();
  const slots = userLibrarySidebar({ isMobile });

  return (
    <div className={slots.container()} aria-expanded={sidebarState === "show"}>
      <div className={slots.contentWrapper()}>
        <UserLibrarySidebarTitle />
      </div>
    </div>
  );
};
