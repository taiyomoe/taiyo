import { Turnstile } from "@marsidev/react-turnstile"
import { cn } from "@taiyomoe/ui/utils/cn"
import {
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form"
import { env } from "~/env"

export const TurnstileField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  className,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  className?: string
}) => {
  const { field } = useController(props)

  return (
    <Turnstile
      className={cn("min-h-20", className)}
      siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      onSuccess={(token) => field.onChange(token)}
      options={{ size: "flexible" }}
    />
  )
}
