import type { ButtonProps } from "@nextui-org/button"
import { Button } from "@nextui-org/button"

type Props = {
  icon: ButtonProps["startContent"]
  onPress: ButtonProps["onPress"]
}

export const FloatingActionButton = ({ icon, onPress }: Props) => {
  return (
    <Button
      className="fixed right-6 bottom-6 z-40 shadow-large sm:hidden"
      startContent={icon}
      onPress={onPress}
      color="primary"
      radius="full"
      size="lg"
      isIconOnly
    />
  )
}
