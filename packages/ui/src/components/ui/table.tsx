"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type React from "react"
import { cn } from "@/lib/utils"

export type TableVariant = "default" | "card"

export type TableProps = React.ComponentProps<"table"> & {
  variant?: TableVariant
  render?: useRender.ComponentProps<"div">["render"]
}

export function Table({
  className,
  variant = "default",
  render,
  ...props
}: TableProps): React.ReactElement {
  const defaultProps = {
    children: (
      <table
        className={cn(
          "w-full caption-bottom text-sm in-data-[variant=card]:border-separate in-data-[variant=card]:border-spacing-0",
          className,
        )}
        data-slot="table"
        {...props}
      />
    ),
    className: "relative w-full overflow-x-auto",
    "data-slot": "table-container",
    "data-variant": variant,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, {}),
    render,
  })
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">): React.ReactElement {
  return <thead className={cn("[&_tr]:border-b", className)} data-slot="table-header" {...props} />
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">): React.ReactElement {
  return (
    <tbody
      className={cn(
        "relative before:pointer-events-none before:absolute before:inset-px before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] not-in-data-[variant=card]:before:hidden in-data-[variant=card]:rounded-xl in-data-[variant=card]:shadow-xs/5 dark:before:shadow-[0_-1px_--theme(--color-white/8%)] [&_tr:last-child]:border-0 *:in-data-[variant=card]:[tr]:border-0 *:*:in-data-[variant=card]:[tr]:[td]:border-b *:*:in-data-[variant=card]:[tr]:[td]:bg-card *:*:first:first:in-data-[variant=card]:[tr]:[td]:rounded-tl-xl *:*:first:in-data-[variant=card]:[tr]:[td]:border-t *:*:first:in-data-[variant=card]:[tr]:[td]:border-l *:*:last:last:in-data-[variant=card]:[tr]:[td]:rounded-br-xl *:*:last:in-data-[variant=card]:[tr]:[td]:border-r *:*:first:last:in-data-[variant=card]:[tr]:[td]:rounded-tr-xl *:*:first:last:in-data-[variant=card]:[tr]:[td]:rounded-bl-xl *:*:hover:in-data-[variant=card]:[tr]:[td]:bg-[color-mix(in_srgb,var(--card),var(--color-black)_2%)] *:*:in-data-[variant=card]:[tr]:data-[state=selected]:[td]:bg-[color-mix(in_srgb,var(--card),var(--color-black)_4%)] *:*:hover:dark:in-data-[variant=card]:[tr]:[td]:bg-[color-mix(in_srgb,var(--card),var(--color-white)_2%)] *:*:dark:in-data-[variant=card]:[tr]:data-[state=selected]:[td]:bg-[color-mix(in_srgb,var(--card),var(--color-white)_4%)]",
        className,
      )}
      data-slot="table-body"
      {...props}
    />
  )
}

export function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">): React.ReactElement {
  return (
    <tfoot
      className={cn(
        "border-t bg-transparent font-medium not-in-data-[variant=card]:bg-[color-mix(in_srgb,var(--card),var(--color-black)_2%)] in-data-[variant=card]:border-none dark:not-in-data-[variant=card]:bg-[color-mix(in_srgb,var(--card),var(--color-white)_2%)] last:[&>tr]:border-b-0",
        className,
      )}
      data-slot="table-footer"
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">): React.ReactElement {
  return (
    <tr
      className={cn(
        "relative border-b hover:not-in-data-[variant=card]:bg-[color-mix(in_srgb,var(--background),var(--color-black)_2%)] not-in-data-[variant=card]:data-[state=selected]:bg-[color-mix(in_srgb,var(--background),var(--color-black)_4%)] hover:dark:not-in-data-[variant=card]:bg-[color-mix(in_srgb,var(--background),var(--color-white)_2%)] dark:not-in-data-[variant=card]:data-[state=selected]:bg-[color-mix(in_srgb,var(--background),var(--color-white)_4%)]",
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">): React.ReactElement {
  return (
    <th
      className={cn(
        "h-10 px-2.5 text-left align-middle leading-none font-medium whitespace-nowrap text-muted-foreground has-[[role=checkbox]]:w-px first:has-[[role=checkbox]]:pr-0 last:has-[[role=checkbox]]:pl-0",
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">): React.ReactElement {
  return (
    <td
      className={cn(
        "bg-clip-padding p-2.5 align-middle leading-none whitespace-nowrap in-data-[slot=table-footer]:py-3.5 first:in-data-[variant=card]:pl-[calc(--spacing(2.5)-1px)] last:in-data-[variant=card]:pr-[calc(--spacing(2.5)-1px)] has-[[role=checkbox]]:w-px first:has-[[role=checkbox]]:pr-0 last:has-[[role=checkbox]]:pl-0",
        className,
      )}
      data-slot="table-cell"
      {...props}
    />
  )
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">): React.ReactElement {
  return (
    <caption
      className={cn("mt-4 text-sm text-muted-foreground in-data-[variant=card]:my-4", className)}
      data-slot="table-caption"
      {...props}
    />
  )
}
