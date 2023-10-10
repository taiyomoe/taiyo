import { Divider } from "@nextui-org/divider";

import { ReaderSettingsMediaChapterDropdown } from "../ui/ReaderSettingsMediaChapterDropdown";
import { ReaderSettingsMediaChapterPageDropdown } from "../ui/ReaderSettingsMediaChapterPageDropdown";
import { ReaderSettingsMediaChapterReportModal } from "../ui/ReaderSettingsMediaChapterReportModal";
import { ReaderSettingsMediaChapterScans } from "../ui/ReaderSettingsMediaChapterScans";
import { ReaderSettingsMediaTitle } from "../ui/ReaderSettingsMediaChapterTitle";
import { ReaderSettingsMediaChapterUploader } from "../ui/ReaderSettingsMediaChapterUploader";

export const ReaderLayout = () => {
  return (
    <div className="border-l-divider hidden min-h-full w-[300px] border-l bg-content1 px-4 md:block">
      <div className="fixed flex w-[268px] flex-col gap-2">
        <div className="flex h-[60px] items-center">
          <ReaderSettingsMediaTitle />
        </div>
        <div className="flex flex-col gap-2">
          <ReaderSettingsMediaChapterPageDropdown />
          <ReaderSettingsMediaChapterDropdown />
          <ReaderSettingsMediaChapterReportModal />
        </div>
        <Divider className="my-4" />
        <div className="flex flex-col gap-2">
          <p className="text-md font-medium">Upado por</p>
          <div className="flex flex-col gap-2">
            <ReaderSettingsMediaChapterUploader />
            <ReaderSettingsMediaChapterScans />
          </div>
        </div>
      </div>
    </div>
  );
};
