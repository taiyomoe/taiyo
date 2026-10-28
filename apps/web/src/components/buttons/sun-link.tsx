import type { ComponentProps, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { cn } from "@taiyomoe/ui/utils/cn"
import { Link } from "@tanstack/react-router"
import type { SunSkinProps } from "@/components/buttons/sun-button"
import { SunBody } from "@/components/buttons/sun-body"
import { sunStyles } from "@/components/buttons/sun-styles"

const styles = stylex.create({
  link: {
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    textDecorationLine: "none",
  },
})

export const SunLink = ({
  className,
  children,
  size = "lg",
  block = false,
  style,
  sx,
  ...props
}: Omit<ComponentProps<typeof Link>, "children"> &
  SunSkinProps & {
    children?: ReactNode
  }) => {
  const styleProps = stylex.props(
    sunStyles.base,
    styles.link,
    sunStyles[size],
    block && sunStyles.block,
    sx,
  )

  return (
    <Link
      className={cn(styleProps.className, className)}
      style={{ ...styleProps.style, ...style }}
      {...props}
    >
      <SunBody>{children}</SunBody>
    </Link>
  )
}
