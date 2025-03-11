import {} from "lucide-react"
import { useTranslations } from "next-intl"
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { PasswordInput } from "~/components/ui/password-input"
import { PasswordStrength } from "~/components/ui/password-strength"

export const PasswordField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  showStrength,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label?: string
  showStrength?: boolean
}) => {
  const t = useTranslations("global")

  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label ?? t("password")}</FormLabel>
          <FormControl>
            <PasswordInput placeholder="•••••••••••••" {...field} />
          </FormControl>
          {showStrength && <PasswordStrength value={field.value} />}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
