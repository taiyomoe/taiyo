import { Button } from "@nextui-org/button"
import { useFormikContext } from "formik"
import { Trash2Icon } from "lucide-react"

type Props = {
  className?: string
  onPress: () => void
}

export const FormDeleteButton = ({ className, onPress }: Props) => {
  const { values } = useFormikContext()

  const shouldDisable = Array.isArray(values) && values.length === 1

  return (
    <Button
      className={className}
      startContent={<Trash2Icon className="h-5 w-5" />}
      onPress={onPress}
      color="danger"
      variant="light"
      size="sm"
      isDisabled={shouldDisable}
      isIconOnly
    />
  )
}
