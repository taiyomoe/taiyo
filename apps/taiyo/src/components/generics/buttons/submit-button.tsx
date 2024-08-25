import type { ButtonProps } from "@nextui-org/button"
import { Button } from "@nextui-org/button"
import { useFormState } from "react-hook-form"
import { cn } from "~/lib/utils/cn"

export const SubmitButton = ({
  className,
  isDisabled,
  children,
}: ButtonProps) => {
  const { isSubmitting, isValid, isDirty, errors } = useFormState()
  const shouldDisableButton =
    isSubmitting ||
    !(isValid && isDirty) ||
    isDisabled ||
    Object.keys(errors).length !== 0

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
