import { m } from "@/paraglide/messages"
import { Mail01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { ComponentProps } from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

export const EmailField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  ...props
}: Omit<ComponentProps<typeof InputGroupInput>, "name" | "type"> & {
  name: TName
  control: Control<TFieldValues>
  label?: string
  description?: string
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { value, ...field },
        fieldState: { invalid, isTouched, isDirty, error },
        formState: { disabled },
      }) => (
        <Field>
          <FieldLabel>{label ? label : m.global_email()}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              type="email"
              value={value ?? ""}
              disabled={disabled || undefined}
              aria-invalid={invalid || undefined}
              data-touched={isTouched || undefined}
              data-dirty={isDirty || undefined}
              {...field}
              {...props}
            />
            <InputGroupAddon align="inline-start">
              <HugeiconsIcon icon={Mail01Icon} />
            </InputGroupAddon>
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          {error && <FieldError>{error.message}</FieldError>}
        </Field>
      )}
    />
  )
}
