import { ReaderMediaChapterDropdown } from "../ui/ReaderMediaChapterDropdown";
import { ReaderMediaChapterPageDropdown } from "../ui/ReaderMediaChapterPageDropdown";
import { ReaderMediaChapterReportModal } from "../ui/ReaderMediaChapterReportModal";
import { ReaderMediaTitle } from "../ui/ReaderMediaTitle";

export const ReaderLayout = () => {
  return (
    <div className="border-l-divider flex w-[300px] flex-col gap-2 border-l bg-content1 px-4">
      <div className="flex h-[60px] items-center">
        <ReaderMediaTitle />
      </div>
      <div className="flex flex-col gap-2">
        <ReaderMediaChapterPageDropdown />
        <ReaderMediaChapterDropdown />
        <ReaderMediaChapterReportModal />
      </div>
    </div>
  );
};
