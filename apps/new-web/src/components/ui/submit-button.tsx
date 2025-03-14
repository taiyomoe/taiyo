"use client"

import { Slot } from "@radix-ui/react-slot"
import { useFormState } from "react-hook-form"
import { Button, type ButtonProps } from "~/components/ui/button"

type Props = ButtonProps & { asChild?: boolean }

export const SubmitButton = ({
  asChild = false,
  isDisabled,
  children,
  ...props
}: Props) => {
  const Comp = asChild ? Slot : Button
  const { isSubmitting, isValid, isDirty, errors } = useFormState()
  const shouldDisableButton =
    isSubmitting ||
    !(isValid && isDirty) ||
    isDisabled ||
    Object.keys(errors).length !== 0

  return (
    <Comp {...props} isDisabled={shouldDisableButton} type="submit">
      {children}
    </Comp>
  )
}
