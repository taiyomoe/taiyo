import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form"
import { Checkbox } from "~/components/ui/checkbox"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form"
import { labelVariants } from "~/components/ui/label"

export const CheckboxField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  className,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label: string
  placeholder?: string
  className?: string
}) => (
  <FormField
    {...props}
    render={({ field }) => (
      <FormItem className={className}>
        <FormControl>
          <Checkbox defaultSelected={field.value} {...field}>
            <span className={labelVariants()}>{label}</span>
          </Checkbox>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)
