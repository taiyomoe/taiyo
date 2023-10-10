import type { ButtonProps } from "@nextui-org/button";
import { Button } from "@nextui-org/button";
import { ChevronRightIcon } from "lucide-react";

type Props = {
  isDisabled: ButtonProps["isDisabled"];
};

export const ForwardButton = ({ isDisabled }: Props) => {
  return (
    <Button
      className="h-auto"
      startContent={<ChevronRightIcon size={20} />}
      isDisabled={isDisabled}
      radius="sm"
      size="sm"
      isIconOnly
    />
  );
};
