import { Checkbox } from "@taiyomoe/ui/components/checkbox"
import { Label } from "@taiyomoe/ui/components/label"
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form"

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
          <Checkbox id={field.name} checked={field.value} {...field} />
          <Label htmlFor={field.name}>{label}</Label>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)
