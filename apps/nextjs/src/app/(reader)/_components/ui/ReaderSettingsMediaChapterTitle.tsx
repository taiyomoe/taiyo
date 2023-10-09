import { Button } from "@nextui-org/button";
import { ChevronRightIcon } from "lucide-react";

import { DisplayMediaChapterTitle } from "~/components/ui/DisplayMediaChapterTitle";

export const ReaderSettingsMediaTitle = () => {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <DisplayMediaChapterTitle className="text-lg font-semibold" />
      <Button
        isIconOnly
        startContent={<ChevronRightIcon size={20} />}
        size="sm"
      />
    </div>
  );
};
