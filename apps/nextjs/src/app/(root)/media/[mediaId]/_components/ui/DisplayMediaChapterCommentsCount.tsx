import { MessageSquareIcon } from "lucide-react";

export const DisplayMediaChapterCommentsCount = () => {
  return (
    <div className="flex w-full items-center justify-end gap-1 md:justify-start">
      <MessageSquareIcon size={20} />
      <p className="select-none rounded px-1 text-sm">X</p>
    </div>
  );
};
