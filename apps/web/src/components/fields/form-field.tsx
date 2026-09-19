import { m } from "@/paraglide/messages"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { PasswordInput, type PasswordInputProps } from "@taiyomoe/ui/components/ui/password-input"
import type { ComponentProps, ReactNode } from "react"
import type {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form"
import { Controller } from "react-hook-form"

type Bound<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  name: TName
  control: Control<TFieldValues>
  label?: ReactNode
  description?: string
}

const toControlProps = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  { value, ...field }: ControllerRenderProps<TFieldValues, TName>,
  state: { invalid: boolean; isTouched: boolean; isDirty: boolean },
  form: UseFormStateReturn<TFieldValues>,
) => ({
  value: (value ?? "") as string,
  disabled: form.disabled || undefined,
  "aria-invalid": state.invalid || undefined,
  "data-touched": state.isTouched || undefined,
  "data-dirty": state.isDirty || undefined,
  ...field,
})

type ControlProps = ReturnType<typeof toControlProps>

/**
 * Owns the envelope every bound field shares: the Controller subscription, the
 * label/description/error frame, and the mapping from react-hook-form state
 * onto the `data-*` and `aria-*` attributes @taiyomoe/ui styles against.
 */
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
      <Field>
        {label ? <FieldLabel>{label}</FieldLabel> : null}
        {children(toControlProps(field, fieldState, formState) as ControlProps)}
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
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
    startIcon?: ReactNode
    endIcon?: ReactNode
  }) => (
  <BoundField name={name} control={control} label={label} description={description}>
    {(field) => (
      <InputGroup>
        <InputGroupInput {...field} {...props} />
        {startIcon ? <InputGroupAddon align="inline-start">{startIcon}</InputGroupAddon> : null}
        {endIcon ? <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon> : null}
      </InputGroup>
    )}
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
  Omit<Bound<TFieldValues, TName>, "description"> & { label: ReactNode }) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { value, onChange, ...field }, fieldState, formState }) => (
      <Field>
        <FieldLabel>
          <Checkbox
            checked={value ?? false}
            onCheckedChange={(checked) => onChange(checked === true)}
            disabled={formState.disabled || undefined}
            aria-invalid={fieldState.invalid || undefined}
            {...field}
            {...props}
          />
          {label}
        </FieldLabel>
        {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
      </Field>
    )}
  />
)
