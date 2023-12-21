import { tv } from "@nextui-org/react";

import { ReaderSettingsMediaChapterDropdown } from "~/app/(reader)/_components/sidebarMode/ui/ReaderSettingsMediaChapterDropdown";
import { useReaderStore } from "~/stores";

const mediaChapterPageActions = tv({
  slots: {
    container: "flex mt-4 p-bodyPadding justify-center",
  },
});

export const MediaChapterPageActions = () => {
  const pageMode = useReaderStore((state) => state.settings.page.mode);

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
