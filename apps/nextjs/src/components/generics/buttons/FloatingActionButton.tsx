import type { ButtonProps } from "@nextui-org/button";
import { Button } from "@nextui-org/button";

type Props = {
  icon: ButtonProps["startContent"];
  onPress: ButtonProps["onPress"];
};

export const FloatingActionButton = ({ icon, onPress }: Props) => {
  return (
    <Button
      className="fixed bottom-6 right-6 sm:hidden"
      startContent={icon}
      onPress={onPress}
      color="primary"
      radius="full"
      size="lg"
      isIconOnly
    />
  );
};
