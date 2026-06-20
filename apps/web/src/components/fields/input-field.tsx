import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { ComponentProps } from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

export const InputField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  startIcon,
  endIcon,
  ...props
}: Omit<ComponentProps<typeof InputGroupInput>, "name"> & {
  name: TName
  control: Control<TFieldValues>
  label: string
  description?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { value, ...field },
        fieldState: { invalid, isTouched, isDirty, error },
      }) => (
        <Field>
          <FieldLabel>{label}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              type="email"
              value={value ?? ""}
              aria-invalid={invalid || undefined}
              data-touched={isTouched || undefined}
              data-dirty={isDirty || undefined}
              {...field}
              {...props}
            />
            {startIcon && <InputGroupAddon align="inline-start">{startIcon}</InputGroupAddon>}
            {endIcon && <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon>}
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          {error && <FieldError>{error.message}</FieldError>}
        </Field>
      )}
    />
  )
}
