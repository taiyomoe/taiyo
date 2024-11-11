import { Button, type ButtonProps } from "@nextui-org/button"
import { useFormContext } from "react-hook-form"

export const ResetButton = (props: ButtonProps) => {
  const {
    reset,
    formState: { isSubmitSuccessful },
  } = useFormContext()

  const handlePress = () => {
    reset({})
  }

  if (isSubmitSuccessful) {
    return <Button onPress={handlePress} variant="flat" {...props} />
  }

  return null
}
