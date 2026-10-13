import type * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { a11y } from "../../styles/recipes"
import { consts, motion } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"
import { ChevronLeft, ChevronRight, Ellipsis } from "../icons"
import { type Button, buttonVariants } from "./button"

const styles = stylex.create({
  nav: {
    marginInline: "auto",
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  content: {
    gap: "0.25rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
  },
  edgeLink: {
    padding: {
      default: 0,
      [consts.sm]: null,
    },
    aspectRatio: {
      default: "1",
      [consts.sm]: "auto",
    },
  },
  edgeLabel: {
    display: {
      default: "none",
      [consts.sm]: "inline",
    },
  },
  edgeIcon: {
    transitionDuration: {
      default: "200ms",
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionProperty: "translate",
    transitionTimingFunction: motion.easeOut,
  },
  previousIcon: {
    translate: {
      default: "0",
      ":is(:hover > *)": "-0.1875rem",
    },
    marginLeft: {
      default: null,
      [consts.sm]: "-0.25rem",
    },
  },
  nextIcon: {
    translate: {
      default: "0",
      ":is(:hover > *)": "0.1875rem",
    },
    marginRight: {
      default: null,
      [consts.sm]: "-0.25rem",
    },
  },
  ellipsis: {
    display: "flex",
    justifyContent: "center",
    minWidth: "1.75rem",
  },
  ellipsisIcon: {
    height: {
      default: "1.25rem",
      [consts.sm]: "1rem",
    },
    width: {
      default: "1.25rem",
      [consts.sm]: "1rem",
    },
  },
})

export function Pagination({
  className,
  sx,
  ...props
}: React.ComponentProps<"nav"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.nav, sx)

  return (
    <nav
      aria-label="pagination"
      className={cn(styleProps.className, className)}
      data-slot="pagination"
      style={styleProps.style}
      {...props}
    />
  )
}

export function PaginationContent({
  className,
  sx,
  ...props
}: React.ComponentProps<"ul"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.content, sx)

  return (
    <ul
      className={cn(styleProps.className, className)}
      data-slot="pagination-content"
      style={styleProps.style}
      {...props}
    />
  )
}

export function PaginationItem({ ...props }: React.ComponentProps<"li">): React.ReactElement {
  return <li data-slot="pagination-item" {...props} />
}

export type PaginationLinkProps = {
  isActive?: boolean
  size?: React.ComponentProps<typeof Button>["size"]
  sx?: Sx
} & useRender.ComponentProps<"a">

export function PaginationLink({
  className,
  isActive,
  size = "icon",
  render,
  sx,
  ...props
}: PaginationLinkProps): React.ReactElement {
  const styleProps = stylex.props(sx)
  const defaultProps = {
    "aria-current": isActive === true ? ("page" as const) : undefined,
    className: cn(
      buttonVariants({
        size,
        variant: isActive === true ? "outline" : "ghost",
      }),
      styleProps.className,
      className,
    ),
    "data-active": isActive,
    "data-slot": "pagination-link",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(defaultProps, props),
    render,
  })
}

export function PaginationPrevious({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.ReactElement {
  const iconProps = stylex.props(styles.edgeIcon, styles.previousIcon)
  const labelProps = stylex.props(styles.edgeLabel)

  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={className}
      size="default"
      sx={[styles.edgeLink, sx]}
      {...props}
    >
      <ChevronLeft className={iconProps.className} style={iconProps.style} />
      <span className={labelProps.className} style={labelProps.style}>
        Previous
      </span>
    </PaginationLink>
  )
}

export function PaginationNext({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.ReactElement {
  const iconProps = stylex.props(styles.edgeIcon, styles.nextIcon)
  const labelProps = stylex.props(styles.edgeLabel)

  return (
    <PaginationLink
      aria-label="Go to next page"
      className={className}
      size="default"
      sx={[styles.edgeLink, sx]}
      {...props}
    >
      <span className={labelProps.className} style={labelProps.style}>
        Next
      </span>
      <ChevronRight className={iconProps.className} style={iconProps.style} />
    </PaginationLink>
  )
}

export function PaginationEllipsis({
  className,
  sx,
  ...props
}: React.ComponentProps<"span"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.ellipsis, sx)
  const iconProps = stylex.props(styles.ellipsisIcon)
  const srOnlyProps = stylex.props(a11y.srOnly)

  return (
    <span
      aria-hidden
      className={cn(styleProps.className, className)}
      data-slot="pagination-ellipsis"
      style={styleProps.style}
      {...props}
    >
      <Ellipsis className={iconProps.className} style={iconProps.style} />
      <span className={srOnlyProps.className} style={srOnlyProps.style}>
        More pages
      </span>
    </span>
  )
}
