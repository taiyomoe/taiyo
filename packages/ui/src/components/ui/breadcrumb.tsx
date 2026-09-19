"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import { ChevronRight, Ellipsis } from "@/components/icons"
import type { Sx } from "../../styles/sx"
import { colors, consts } from "../../styles/tokens.stylex"

const styles = stylex.create({
  list: {
    gap: {
      default: "0.375rem",
      [consts.sm]: "0.625rem",
    },
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    overflowWrap: "break-word",
  },
  item: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
  },
  link: {
    color: {
      default: null,
      ":hover": colors.foreground,
    },
    transitionProperty: "color",
  },
  page: {
    color: colors.foreground,
    fontWeight: 400,
  },
  separator: {
    opacity: 0.8,
  },
  icon: {
    height: "1rem",
    width: "1rem",
  },
  srOnly: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
})

export function Breadcrumb({ ...props }: React.ComponentProps<"nav">): React.ReactElement {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

export function BreadcrumbList({
  className,
  sx,
  ...props
}: React.ComponentProps<"ol"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.list, sx)

  return (
    <ol
      className={cn(styleProps.className, className)}
      data-slot="breadcrumb-list"
      style={styleProps.style}
      {...props}
    />
  )
}

export function BreadcrumbItem({
  className,
  sx,
  ...props
}: React.ComponentProps<"li"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.item, sx)

  return (
    <li
      className={cn(styleProps.className, className)}
      data-slot="breadcrumb-item"
      style={styleProps.style}
      {...props}
    />
  )
}

export function BreadcrumbLink({
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"a"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.link, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "breadcrumb-link",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(defaultProps, props),
    render,
  })
}

export function BreadcrumbPage({
  className,
  sx,
  ...props
}: React.ComponentProps<"span"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.page, sx)

  return (
    <span
      aria-current="page"
      className={cn(styleProps.className, className)}
      data-slot="breadcrumb-page"
      style={styleProps.style}
      {...props}
    />
  )
}

export function BreadcrumbSeparator({
  children,
  className,
  sx,
  ...props
}: React.ComponentProps<"li"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.separator, sx)
  const iconProps = stylex.props(styles.icon)

  return (
    <li
      aria-hidden="true"
      className={cn(styleProps.className, className)}
      data-slot="breadcrumb-separator"
      role="presentation"
      style={styleProps.style}
      {...props}
    >
      {children ?? <ChevronRight className={iconProps.className} style={iconProps.style} />}
    </li>
  )
}

export function BreadcrumbEllipsis({
  className,
  sx,
  ...props
}: React.ComponentProps<"span"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)
  const iconProps = stylex.props(styles.icon)
  const srOnlyProps = stylex.props(styles.srOnly)

  return (
    <span
      aria-hidden="true"
      className={cn(styleProps.className, className)}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      style={styleProps.style}
      {...props}
    >
      <Ellipsis className={iconProps.className} style={iconProps.style} />
      <span className={srOnlyProps.className} style={srOnlyProps.style}>
        More
      </span>
    </span>
  )
}
