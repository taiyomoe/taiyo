import { Button, type ButtonProps } from "@nextui-org/button"
import { useFormContext } from "react-hook-form"

export const ResetButton = ({ onPress, ...props }: ButtonProps) => {
  const {
    reset,
    formState: { isSubmitSuccessful },
  } = useFormContext()

  const handlePress: ButtonProps["onPress"] = (e) => {
    reset()
    onPress?.(e)
  }

  if (isSubmitSuccessful) {
    return <Button onPress={handlePress} variant="flat" {...props} />
  }

  return null
}
