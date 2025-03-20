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
  children,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label?: string
  showStrength?: boolean
  children?: React.ReactNode
}) => {
  const t = useTranslations("global")

  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between text-sm leading-none">
            <FormLabel className="only">{label ?? t("password")}</FormLabel>
            {children}
          </div>
          <FormControl>
            <PasswordInput placeholder="•••••••••••••" {...field} />
          </FormControl>
          {showStrength && <PasswordStrength value={field.value} />}
          {!showStrength && <FormMessage />}
        </FormItem>
      )}
    />
  )
}
