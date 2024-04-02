import type { ButtonProps } from "@nextui-org/button"
import { Button } from "@nextui-org/button"
import { useFormState } from "react-hook-form"

export const SubmitButton = ({ isDisabled, children }: ButtonProps) => {
  const { isSubmitting, isValid, isDirty, errors } = useFormState()
  const shouldDisableButton =
    isSubmitting || !(isValid && isDirty) || isDisabled

  console.log(
    "errors",
    errors,
    isSubmitting,
    isValid,
    isDirty,
    !(isValid && isDirty),
  )

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
