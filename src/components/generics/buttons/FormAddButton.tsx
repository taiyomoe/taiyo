import { Button } from "@nextui-org/button"
import { PlusIcon } from "lucide-react"

type Props = {
  onPress: () => void
}

export const FormAddButton = ({ onPress }: Props) => (
  <Button
    startContent={<PlusIcon className="h-6 w-6" />}
    onPress={onPress}
    color="primary"
    variant="light"
    size="sm"
    isIconOnly
  />
)
