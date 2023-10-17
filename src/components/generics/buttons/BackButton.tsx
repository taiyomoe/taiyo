import type { ButtonProps } from "@nextui-org/button";
import { Button } from "@nextui-org/button";
import { ChevronLeftIcon } from "lucide-react";

export const BackButton = (props: ButtonProps) => {
  return (
    <Button
      className="h-auto"
      startContent={<ChevronLeftIcon className="h-5 w-5 focus:outline-none" />}
      radius="sm"
      size="sm"
      isIconOnly
      {...props}
    />
  );
};
