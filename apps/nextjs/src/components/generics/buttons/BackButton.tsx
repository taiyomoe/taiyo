import type { ButtonProps } from "@nextui-org/button";
import { Button } from "@nextui-org/button";
import { ChevronLeftIcon } from "lucide-react";

type Props = {
  isDisabled: ButtonProps["isDisabled"];
};

export const BackButton = ({ isDisabled }: Props) => {
  return (
    <Button
      className="h-auto"
      startContent={<ChevronLeftIcon size={20} />}
      isDisabled={isDisabled}
      radius="sm"
      size="sm"
      isIconOnly
    />
  );
};
