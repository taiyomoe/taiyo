import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ComponentProps } from "react"
import * as stylex from "@stylexjs/stylex"
import { cn } from "@taiyomoe/ui/utils/cn"
import { SunBody } from "@/components/buttons/sun-body"
import { sunStyles } from "@/components/buttons/sun-styles"

const styles = stylex.create({
  disabled: {
    transform: null,
  },
})

export type SunSkinProps = {
  size?: "md" | "lg"
  block?: boolean
  sx?: Sx
}

export type SunButtonProps = ComponentProps<"button"> &
  SunSkinProps & {
    loading?: boolean
  }

export const SunButton = ({
  className,
  children,
  loading = false,
  size = "md",
  block = false,
  disabled,
  style,
  sx,
  type = "button",
  ...props
}: SunButtonProps) => {
  const isDisabled = disabled === true || loading
  const styleProps = stylex.props(
    sunStyles.base,
    sunStyles[size],
    block && sunStyles.block,
    isDisabled && styles.disabled,
    sx,
  )

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(styleProps.className, className)}
      style={{ ...styleProps.style, ...style }}
      {...props}
    >
      <SunBody loading={loading}>{children}</SunBody>
    </button>
  )
}
