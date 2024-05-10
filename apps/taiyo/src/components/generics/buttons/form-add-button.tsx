import { Button } from "@nextui-org/button"
import { PlusIcon } from "lucide-react"

type Props = {
  className?: string
  onPress: () => void
}

export const FormAddButton = ({ className, onPress }: Props) => (
  <Button
    className={className}
    startContent={<PlusIcon className="h-6 w-6" />}
    onPress={onPress}
    color="primary"
    variant="light"
    size="sm"
    isIconOnly
  />
)
