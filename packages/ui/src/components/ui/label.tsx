import type React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { breakpoints, colors } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

const styles = stylex.create({
  base: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [breakpoints.sm]: "0.875rem",
    },
    fontWeight: 500,
    lineHeight: {
      default: "1.125rem",
      [breakpoints.sm]: "1rem",
    },
  },
})

export function Label({
  className,
  render,
  sx,
  style,
  ...props
}: useRender.ComponentProps<"label"> & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.base, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "label",
    style: { ...styleProps.style, ...style },
  }

  return useRender({
    defaultTagName: "label",
    props: mergeProps<"label">(defaultProps, props),
    render,
  })
}
