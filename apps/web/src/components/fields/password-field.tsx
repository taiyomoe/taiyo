import { m } from "@/paraglide/messages"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { PasswordInput, type PasswordInputProps } from "@taiyomoe/ui/components/ui/password-input"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

export const PasswordField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  ...props
}: Omit<PasswordInputProps, "name"> & {
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
      }) => (
        <Field>
          <FieldLabel>{label ? label : m.global_password()}</FieldLabel>
          <PasswordInput
            value={value ?? ""}
            aria-invalid={invalid || undefined}
            data-touched={isTouched || undefined}
            data-dirty={isDirty || undefined}
            {...field}
            {...props}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {error && <FieldError>{error.message}</FieldError>}
        </Field>
      )}
    />
  )
}
