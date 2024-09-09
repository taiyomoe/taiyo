import { Button } from "@nextui-org/button"
import { Trash2Icon } from "lucide-react"
import { useFormContext } from "react-hook-form"

type Props = {
  name?: string
  className?: string
  onPress: () => void
}

export const FormDeleteButton = ({ name, className, onPress }: Props) => {
  const { getValues } = useFormContext()
  const values = getValues(name ?? "")

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
