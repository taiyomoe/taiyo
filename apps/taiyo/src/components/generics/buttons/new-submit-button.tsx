import type { ButtonProps } from "@nextui-org/button"
import { Button } from "@nextui-org/button"
import { useFormState } from "react-hook-form"

export const SubmitButton = ({ isDisabled, children }: ButtonProps) => {
  const { isSubmitting, isValid, isDirty, errors } = useFormState()
  const shouldDisableButton =
    isSubmitting ||
    !(isValid && isDirty) ||
    isDisabled ||
    Object.keys(errors).length !== 0

  // console.log("isSubmitting", isSubmitting)
  // console.log("isValid", isValid)
  // console.log("isDirty", isDirty)
  // console.log("isDisabled", isDisabled)
  // console.log("values", getValues())
  // console.log("errors", errors)

  return (
    <Button
      className="w-fit font-medium"
      isDisabled={shouldDisableButton}
      isLoading={isSubmitting}
      color="primary"
      type="submit"
    >
      {children}
    </Button>
  )
}
