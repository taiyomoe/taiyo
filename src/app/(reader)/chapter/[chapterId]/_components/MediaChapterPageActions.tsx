import { tv } from "@nextui-org/react";
import { useAtomValue } from "jotai";

import { ReaderSettingsMediaChapterDropdown } from "~/app/(reader)/_components/sidebarMode/ui/ReaderSettingsMediaChapterDropdown";
import { readerPageModeAtom } from "~/atoms/readerSettings.atoms";

const mediaChapterPageActions = tv({
  slots: {
    container: "flex mt-4 p-bodyPadding justify-center",
  },
});

export const MediaChapterPageActions = () => {
  const pageMode = useAtomValue(readerPageModeAtom);

  const { container } = mediaChapterPageActions();

  if (pageMode === "single") {
    return null;
  }

  return (
    <div className={container()}>
      <ReaderSettingsMediaChapterDropdown />
    </div>
  );
};
