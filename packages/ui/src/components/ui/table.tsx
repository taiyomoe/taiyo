"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import { cn } from "@/utils/cn"
import type { Sx } from "../../styles/sx"
import { colors, radius, shadows } from "../../styles/tokens.stylex"

export type TableVariant = "default" | "card"

/**
 * StyleX has no ancestor selector that reaches arbitrary depth, and every
 * element in this file is ours, so the variant travels through context.
 */
const TableVariantContext = React.createContext<TableVariant>("default")
const styles = stylex.create({
  container: {
    position: "relative",
    overflowX: "auto",
    width: "100%",
  },
  table: {
    captionSide: "bottom",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    width: "100%",
  },
  tableCard: {
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  body: {
    position: "relative",
  },
  bodyCard: {
    borderRadius: radius.xl,
    boxShadow: shadows.raised,
    "::before": {
      inset: "1px",
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  footer: {
    backgroundColor: `color-mix(in srgb, ${colors.card}, ${colors.foreground} 2%)`,
    fontWeight: 500,
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  footerCard: {
    backgroundColor: "transparent",
    borderTopStyle: "none",
  },
  row: {
    backgroundColor: {
      '[data-state="selected"]': `color-mix(in srgb, ${colors.background}, ${colors.foreground} 4%)`,
      default: null,
      ":hover": `color-mix(in srgb, ${colors.background}, ${colors.foreground} 2%)`,
    },
    position: "relative",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  rowLast: {
    // `default` has to repeat the 1px from `row`: a `null` default is still a
    // declaration, and it won `row`'s, leaving every plain-variant row with no
    // separator at all.
    borderBottomWidth: {
      default: 1,
      ":last-child": 0,
    },
  },
  rowCard: {
    position: "relative",
    borderBottomWidth: 0,
  },
  head: {
    paddingInline: "0.625rem",
    color: colors.mutedForeground,
    fontWeight: 500,
    lineHeight: 1,
    textAlign: "left",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    height: "2.5rem",
  },
  cell: {
    padding: "0.625rem",
    backgroundClip: "padding-box",
    lineHeight: 1,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  cellCard: {
    // `cell` clips the background to the padding box, which is right for the
    // plain variant but wrong here: the hairline separators are translucent,
    // so clipping made them composite over the PAGE instead of over the card
    // fill. In dark that turned a white/8% line into a 1-value difference —
    // the separators effectively disappeared.
    backgroundClip: "border-box",
    backgroundColor: {
      default: colors.card,
      ":hover": `color-mix(in srgb, ${colors.card}, ${colors.foreground} 2%)`,
    },
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    borderLeftColor: colors.border,
    borderLeftStyle: "solid",
    borderLeftWidth: {
      default: 0,
      ":first-child": 1,
    },
    borderRightColor: colors.border,
    borderRightStyle: "solid",
    borderRightWidth: {
      default: 0,
      ":last-child": 1,
    },
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    paddingLeft: {
      default: "0.625rem",
      ":first-child": "calc(0.625rem - 1px)",
    },
    paddingRight: {
      default: "0.625rem",
      ":last-child": "calc(0.625rem - 1px)",
    },
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    marginTop: "1rem",
  },
  captionCard: {
    marginBlock: "1rem",
  },
})

export type TableProps = React.ComponentProps<"table"> & {
  variant?: TableVariant
  render?: useRender.ComponentProps<"div">["render"]
  sx?: Sx
}

export function Table({
  className,
  variant = "default",
  render,
  sx,
  ...props
}: TableProps): React.ReactElement {
  const containerProps = stylex.props(styles.container)
  const tableProps = stylex.props(styles.table, variant === "card" && styles.tableCard, sx)
  const defaultProps = {
    children: (
      <TableVariantContext value={variant}>
        <table
          className={cn(tableProps.className, className)}
          data-slot="table"
          style={tableProps.style}
          {...props}
        />
      </TableVariantContext>
    ),
    className: containerProps.className,
    "data-slot": "table-container",
    "data-variant": variant,
    style: containerProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, {}),
    render,
  })
}

export function TableHeader({
  className,
  sx,
  ...props
}: React.ComponentProps<"thead"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <thead
      className={cn(styleProps.className, className)}
      data-slot="table-header"
      style={styleProps.style}
      {...props}
    />
  )
}

export function TableBody({
  className,
  sx,
  ...props
}: React.ComponentProps<"tbody"> & { sx?: Sx }): React.ReactElement {
  const variant = React.useContext(TableVariantContext)
  const styleProps = stylex.props(styles.body, variant === "card" && styles.bodyCard, sx)

  return (
    <tbody
      className={cn(styleProps.className, className)}
      data-slot="table-body"
      style={styleProps.style}
      {...props}
    />
  )
}

export function TableFooter({
  className,
  sx,
  ...props
}: React.ComponentProps<"tfoot"> & { sx?: Sx }): React.ReactElement {
  const variant = React.useContext(TableVariantContext)
  const styleProps = stylex.props(styles.footer, variant === "card" && styles.footerCard, sx)

  return (
    <tfoot
      className={cn(styleProps.className, className)}
      data-slot="table-footer"
      style={styleProps.style}
      {...props}
    />
  )
}

export function TableRow({
  className,
  sx,
  ...props
}: React.ComponentProps<"tr"> & { sx?: Sx }): React.ReactElement {
  const variant = React.useContext(TableVariantContext)
  const styleProps = stylex.props(
    variant === "card" ? styles.rowCard : styles.row,
    variant !== "card" && styles.rowLast,
    sx,
  )

  return (
    <tr
      className={cn(styleProps.className, className)}
      data-slot="table-row"
      style={styleProps.style}
      {...props}
    />
  )
}

export function TableHead({
  className,
  sx,
  ...props
}: React.ComponentProps<"th"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.head, sx)

  return (
    <th
      className={cn(styleProps.className, className)}
      data-slot="table-head"
      style={styleProps.style}
      {...props}
    />
  )
}

export function TableCell({
  className,
  sx,
  ...props
}: React.ComponentProps<"td"> & { sx?: Sx }): React.ReactElement {
  const variant = React.useContext(TableVariantContext)
  const styleProps = stylex.props(styles.cell, variant === "card" && styles.cellCard, sx)

  return (
    <td
      className={cn(styleProps.className, className)}
      data-slot="table-cell"
      style={styleProps.style}
      {...props}
    />
  )
}

export function TableCaption({
  className,
  sx,
  ...props
}: React.ComponentProps<"caption"> & { sx?: Sx }): React.ReactElement {
  const variant = React.useContext(TableVariantContext)
  const styleProps = stylex.props(styles.caption, variant === "card" && styles.captionCard, sx)

  return (
    <caption
      className={cn(styleProps.className, className)}
      data-slot="table-caption"
      style={styleProps.style}
      {...props}
    />
  )
}
