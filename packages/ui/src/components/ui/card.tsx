"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, radius, shadows, text } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  /**
   * The flagship raised surface: card background, hairline border, xxl
   * corners, the resting elevation shadow and a ::before overlay that draws
   * the 1px light edge of the design language.
   */
  card: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    color: colors.cardForeground,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  /**
   * CardFrame is a card whose ::before also lays a muted wash over the frame
   * body; nested cards punch through it via the clip-path rules in
   * structural.css (StyleX cannot style children).
   */
  frameOverlay: {
    "::before": {
      backgroundColor: `color-mix(in srgb, ${colors.muted} 72%, transparent)`,
    },
  },
  frameHeader: {
    paddingBlock: "1rem",
    paddingInline: "1.5rem",
    alignItems: "start",
    columnGap: "1rem",
    display: "grid",
    gridAutoRows: "min-content",
    gridTemplateRows: "auto auto",
    position: "relative",
  },
  frameTitle: {
    alignSelf: "center",
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: "1.25rem",
  },
  frameDescription: {
    alignSelf: "center",
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  frameAction: {
    gridRow: {
      default: null,
      ":nth-child(3)": "1 / span 2",
    },
    alignSelf: "center",
    display: "inline-flex",
    gridColumnStart: "2",
    justifySelf: "end",
  },
  frameFooter: {
    paddingBlock: "1rem",
    paddingInline: "1.5rem",
  },
  header: {
    padding: "1.5rem",
    gap: "0.375rem",
    alignItems: "start",
    display: "grid",
    gridAutoRows: "min-content",
    gridTemplateRows: "auto auto",
  },
  title: {
    fontSize: text.lg,
    fontWeight: 600,
    lineHeight: 1,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  action: {
    alignSelf: "start",
    display: "inline-flex",
    gridColumnStart: "2",
    gridRowEnd: "span 2",
    gridRowStart: "1",
    justifySelf: "end",
  },
  panel: {
    padding: "1.5rem",
    flexBasis: "0%",
    flexGrow: 1,
    flexShrink: 1,
  },
  footer: {
    padding: "1.5rem",
    alignItems: "center",
    display: "flex",
  },
})

/** See SeparatorProps for why `className` sits alongside `sx`. */
type CardComponentProps = useRender.ComponentProps<"div"> & {
  sx?: Sx
}

export function Card({ className, render, sx, ...props }: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.card, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardFrame({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.card, styles.frameOverlay, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-frame",
    // The clip geometry consumed by the nested-card rules in structural.css:
    // child cards clip themselves 1rem past the frame on top/bottom by
    // default; the first/last card pulls that in to 1px (see structural.css).
    style: {
      "--clip-bottom": "-1rem",
      "--clip-top": "-1rem",
      ...styleProps.style,
    } as React.CSSProperties,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardFrameHeader({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.frameHeader, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-frame-header",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardFrameTitle({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.frameTitle, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-frame-title",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardFrameDescription({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.frameDescription, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-frame-description",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardFrameAction({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.frameAction, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-frame-action",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardFrameFooter({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.frameFooter, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-frame-footer",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardHeader({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.header, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-header",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardTitle({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-title",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardDescription({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-description",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardAction({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.action, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-action",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardPanel({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.panel, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-panel",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function CardFooter({
  className,
  render,
  sx,
  ...props
}: CardComponentProps): React.ReactElement {
  const styleProps = stylex.props(styles.footer, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "card-footer",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export { CardPanel as CardContent }
