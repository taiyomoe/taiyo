import { Button } from "@nextui-org/button";
import { ChevronRightIcon } from "lucide-react";

export const ReaderMediaTitle = () => {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-lg font-semibold">One Piece</p>
      <Button
        isIconOnly
        startContent={<ChevronRightIcon size={20} />}
        size="sm"
      />
    </div>
  );
};
