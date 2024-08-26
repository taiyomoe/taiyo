import type { ButtonProps } from "@nextui-org/button"
import { Button } from "@nextui-org/button"
import { useFormContext, useFormState } from "react-hook-form"
import { cn } from "~/lib/utils/cn"

export const SubmitButton = ({
  className,
  isDisabled,
  children,
}: ButtonProps) => {
  const { isSubmitting, isValid, isDirty, errors } = useFormState()
  const { getFieldState, getValues } = useFormContext()
  const shouldDisableButton =
    isSubmitting ||
    !(isValid && isDirty) ||
    isDisabled ||
    Object.keys(errors).length !== 0

  console.log("shouldDisableButton", shouldDisableButton)
  console.log("isSubmitting", isSubmitting)
  console.log("isValid", isValid)
  console.log("isDirty", isDirty)
  console.log("errors", errors)
  console.log(
    "getFieldState",
    getFieldState("preferredTitles"),
    getValues("preferredTitles"),
  )

  return (
    <Button
      className={cn("w-fit font-medium", className)}
      isDisabled={shouldDisableButton}
      isLoading={isSubmitting}
      color="primary"
      type="submit"
    >
      {children}
    </Button>
  )
}
