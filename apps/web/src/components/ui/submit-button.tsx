"use client"

import { Button, type ButtonProps } from "@taiyomoe/ui/components/button"
import { useFormState } from "react-hook-form"

export const SubmitButton = ({
  asChild = false,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const { isSubmitting, isValid, isDirty, errors } = useFormState()
  const shouldDisableButton =
    isSubmitting ||
    !(isValid && isDirty) ||
    disabled ||
    Object.keys(errors).length !== 0

  return (
    <Button
      {...props}
      disabled={shouldDisableButton}
      isPending={isSubmitting}
      type="submit"
    >
      {children}
    </Button>
  )
}
