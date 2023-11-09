import { tv } from "@nextui-org/react";
import { useAtomValue } from "jotai";

import { ReaderSettingsMediaChapterDropdown } from "~/app/(reader)/_components/sidebarMode/ui/ReaderSettingsMediaChapterDropdown";
import { readerPageModeAtom } from "~/atoms/readerSettings.atoms";

const displayMediaChapterPageActions = tv({
  slots: {
    container: "flex mt-4 p-6 justify-center",
  },
});

export const DisplayMediaChapterPageActions = () => {
  const pageMode = useAtomValue(readerPageModeAtom);

  const { container } = displayMediaChapterPageActions();

  if (pageMode === "single") {
    return null;
  }

  return (
    <div className={container()}>
      <ReaderSettingsMediaChapterDropdown />
    </div>
  );
};
