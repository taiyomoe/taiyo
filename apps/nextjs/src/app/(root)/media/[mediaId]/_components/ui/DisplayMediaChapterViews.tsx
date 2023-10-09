import { EyeIcon } from "lucide-react";

export const DisplayMediaChapterViews = () => {
  return (
    <div className="flex w-full items-center justify-end gap-1 md:justify-start">
      <EyeIcon className="h-4 w-fit md:h-5" />
      <p className="select-none rounded px-1 text-sm">N/A</p>
    </div>
  );
};
