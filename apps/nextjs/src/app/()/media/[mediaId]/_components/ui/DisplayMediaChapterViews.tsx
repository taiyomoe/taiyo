import { EyeIcon } from "lucide-react";

export const DisplayMediaChapterViews = () => {
  return (
    <div className="flex w-full items-center justify-end gap-1 bg-green-100 md:justify-start">
      <EyeIcon size={20} />
      <p className="select-none rounded bg-blue-100 px-1 text-sm">N/A</p>
    </div>
  );
};
