import type { ComponentProps, ReactElement, ReactNode } from "react"
import type {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { PasswordInput, type PasswordInputProps } from "@taiyomoe/ui/components/ui/password-input"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { Controller } from "react-hook-form"
import { m } from "@/paraglide/messages"

type Bound<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  name: TName
  control: Control<TFieldValues>
  label?: string | undefined
  description?: string | undefined
}

const toControlProps = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  { value, ...field }: ControllerRenderProps<TFieldValues, TName>,
  state: { invalid: boolean; isTouched: boolean; isDirty: boolean },
  form: UseFormStateReturn<TFieldValues>,
) => ({
  value: typeof value === "string" || typeof value === "number" ? value : "",
  disabled: form.disabled || undefined,
  "aria-invalid": state.invalid || undefined,
  "data-touched": state.isTouched || undefined,
  "data-dirty": state.isDirty || undefined,
  ...field,
})

type ControlProps = ReturnType<typeof toControlProps>

const BoundField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  control,
  label,
  description,
  children,
}: Bound<TFieldValues, TName> & { children: (control: ControlProps) => ReactNode }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState, formState }) => (
      <Field invalid={fieldState.invalid}>
        {label !== undefined && label !== "" ? <FieldLabel>{label}</FieldLabel> : null}
        {children(toControlProps(field, fieldState, formState))}
        {description !== undefined && description !== "" ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
        {fieldState.error ? <FieldError match>{fieldState.error.message}</FieldError> : null}
      </Field>
    )}
  />
)

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
}: Omit<ComponentProps<typeof InputGroupInput>, "name"> &
  Bound<TFieldValues, TName> & {
    startIcon?: ReactElement | undefined
    endIcon?: ReactElement | undefined
  }) => (
  <BoundField name={name} control={control} label={label} description={description}>
    {(field) => (
      <InputGroup>
        <InputGroupInput {...field} {...props} />
        {startIcon !== undefined ? (
          <InputGroupAddon align="inline-start">{startIcon}</InputGroupAddon>
        ) : null}
        {endIcon !== undefined ? (
          <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon>
        ) : null}
      </InputGroup>
    )}
  </BoundField>
)

export const TextareaField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  ...props
}: Omit<ComponentProps<typeof Textarea>, "name"> & Bound<TFieldValues, TName>) => (
  <BoundField name={name} control={control} label={label} description={description}>
    {(field) => <Textarea {...field} {...props} />}
  </BoundField>
)

export const PasswordField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  ...props
}: Omit<PasswordInputProps, "name"> & Bound<TFieldValues, TName>) => (
  <BoundField
    name={name}
    control={control}
    label={label ?? m.global_password()}
    description={description}
  >
    {(field) => <PasswordInput {...field} {...props} />}
  </BoundField>
)

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
> &
  Omit<Bound<TFieldValues, TName>, "description" | "label"> & { label: ReactNode }) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { value, onChange, ...field }, fieldState, formState }) => (
      <Field>
        <FieldLabel>
          <Checkbox
            checked={value === true}
            onCheckedChange={(checked) => {
              onChange(checked)
            }}
            disabled={formState.disabled || undefined}
            aria-invalid={fieldState.invalid || undefined}
            {...field}
            {...props}
          />
          {label}
        </FieldLabel>
        {fieldState.error ? <FieldError match>{fieldState.error.message}</FieldError> : null}
      </Field>
    )}
  />
)
