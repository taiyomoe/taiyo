"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, consts } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  base: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    fontWeight: 500,
    lineHeight: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
  },
})

/** See the note on SeparatorProps for why `className` sits alongside `sx`. */
export type LabelProps = useRender.ComponentProps<"label"> & {
  sx?: Sx
}

export function Label({ className, render, sx, style, ...props }: LabelProps): React.ReactElement {
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
