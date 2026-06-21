import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { type ComponentProps, type ReactNode } from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

export const CheckboxField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  ...props
}: Omit<
  ComponentProps<typeof Checkbox>,
  "name" | "checked" | "defaultChecked" | "onCheckedChange"
> & {
  name: TName
  control: Control<TFieldValues>
  label: ReactNode
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { invalid, error } }) => (
        <Field>
          <FieldLabel>
            <Checkbox
              checked={value ?? false}
              onCheckedChange={(checked) => onChange(checked === true)}
              aria-invalid={invalid || undefined}
              {...field}
              {...props}
            />
            {label}
          </FieldLabel>
          {error && <FieldError>{error.message}</FieldError>}
        </Field>
      )}
    />
  )
}
