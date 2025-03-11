"use client"

import { useFormState } from "react-hook-form"
import { Button, type ButtonProps } from "~/components/ui/button"

export const SubmitButton = ({
  isDisabled,
  children,
  ...props
}: ButtonProps) => {
  const { isSubmitting, isValid, isDirty, errors } = useFormState()
  const shouldDisableButton =
    isSubmitting ||
    !(isValid && isDirty) ||
    isDisabled ||
    Object.keys(errors).length !== 0

  return (
    <Button {...props} isDisabled={shouldDisableButton} type="submit">
      {children}
    </Button>
  )
}
