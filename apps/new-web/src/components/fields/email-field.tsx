import { useTranslations } from "next-intl"
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"

export const EmailField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  className,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  className?: string
}) => {
  const t = useTranslations("global")

  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{t("email")}</FormLabel>
          <FormControl>
            <Input
              placeholder="galho-preto-pra-caralho@gmail.com"
              type="email"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
