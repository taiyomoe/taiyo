import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils/cn"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import { surface } from "../../styles/recipes"

export type GroupOrientation = "horizontal" | "vertical"

const styles = stylex.create({
  group: {
    display: "flex",
    width: "fit-content",
  },
  vertical: {
    flexDirection: "column",
  },
  text: {
    borderColor: colors.input,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    paddingInline: "calc(0.75rem - 1px)",
    alignItems: "center",
    backgroundClip: "padding-box",
    backgroundColor: colors.muted,
    boxShadow: shadows.chip,
    color: colors.mutedForeground,
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    outlineStyle: "none",
    position: "relative",
    transitionProperty: "box-shadow",
    whiteSpace: "nowrap",
  },
  separator: {
    backgroundColor: colors.input,
    pointerEvents: "none",
    position: "relative",
    zIndex: 2,
  },
})

export function Group({
  className,
  orientation = "horizontal",
  children,
  sx,
  ...props
}: {
  className?: string
  orientation?: GroupOrientation
  children: React.ReactNode
  sx?: Sx
} & React.ComponentProps<"div">): React.ReactElement {
  const styleProps = stylex.props(styles.group, orientation === "vertical" && styles.vertical, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-orientation={orientation}
      data-slot="group"
      role="group"
      style={styleProps.style}
      {...props}
    >
      {children}
    </div>
  )
}

export function GroupText({
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(surface.raisedEdge, styles.text, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "group-text",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps(defaultProps, props),
    render,
  })
}

export function GroupSeparator({
  className,
  orientation = "vertical",
  sx,
  ...props
}: {
  className?: string
  sx?: Sx
} & React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <Separator
      className={className}
      orientation={orientation}
      sx={[styles.separator, sx]}
      {...props}
    />
  )
}

export {
  Group as ButtonGroup,
  GroupText as ButtonGroupText,
  GroupSeparator as ButtonGroupSeparator,
}
