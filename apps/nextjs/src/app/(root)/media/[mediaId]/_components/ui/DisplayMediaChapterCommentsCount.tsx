import { MessageSquareIcon } from "lucide-react";

export const DisplayMediaChapterCommentsCount = () => {
  return (
    <div className="flex w-full items-center justify-end gap-1 bg-green-100 md:justify-start">
      <MessageSquareIcon className="bg-red-100" size={20} />
      <p className="select-none rounded bg-blue-100 px-1 text-sm">X</p>
    </div>
  );
};
