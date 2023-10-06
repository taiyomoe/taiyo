import { Divider } from "@nextui-org/divider";

import { ReaderSettingsMediaChapterDropdown } from "../ui/ReaderSettingsMediaChapterDropdown";
import { ReaderSettingsMediaChapterPageDropdown } from "../ui/ReaderSettingsMediaChapterPageDropdown";
import { ReaderSettingsMediaChapterReportModal } from "../ui/ReaderSettingsMediaChapterReportModal";
import { ReaderSettingsMediaTitle } from "../ui/ReaderSettingsMediaTitle";

export const ReaderLayout = () => {
  return (
    <div className="border-l-divider w-[300px] border-l bg-content1 px-4">
      <div className="fixed flex h-full w-[268px] flex-col gap-2">
        <div className="flex h-[60px] items-center">
          <ReaderSettingsMediaTitle />
        </div>
        <div className="flex flex-col gap-2">
          <ReaderSettingsMediaChapterPageDropdown />
          <ReaderSettingsMediaChapterDropdown />
          <ReaderSettingsMediaChapterReportModal />
        </div>
        <Divider className="my-4" />
      </div>
    </div>
  );
};
