import type { ButtonProps } from "@nextui-org/button";
import { Button } from "@nextui-org/button";
import { ChevronRightIcon } from "lucide-react";

type Props = {
  onPress: () => void;
  isDisabled: ButtonProps["isDisabled"];
};

export const ForwardButton = ({ onPress, isDisabled }: Props) => {
  return (
    <Button
      className="h-auto"
      startContent={<ChevronRightIcon size={20} />}
      onPress={onPress}
      isDisabled={isDisabled}
      radius="sm"
      size="sm"
      isIconOnly
    />
  );
};
