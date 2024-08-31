import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  forwardRef,
} from "react"
import { cn } from "~/lib/utils/cn"

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="scrollbar-thin relative z-0 w-full overflow-auto rounded-large bg-content1 p-4">
      <table
        ref={ref}
        className={cn("h-auto w-full min-w-full table-auto", className)}
        {...props}
      />
    </div>
  ),
)
Table.displayName = "Table"

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&>tr]:first:rounded-lg", className)}
    {...props}
  >
    {children}
    <tr className="mt-1 ml-1 block h-px w-px" tabIndex={-1} aria-hidden />
  </thead>
))
TableHeader.displayName = "TableHeader"

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr[data-state='selected']]:!bg-default/60 [&_tr:first-child_td:first-child]:rounded-tl-lg [&_tr:first-child_td:last-child]:rounded-tr-lg [&_tr:last-child_td:first-child]:rounded-bl-lg [&_tr:last-child_td:last-child]:rounded-br-lg [&_tr:not([data-state='empty']):hover]:bg-default-100 [&_tr:not([data-state='empty']):hover]:bg-opacity-70 [&_tr:nth-child(even)]:bg-default-100",
      className,
    )}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "group [&_td:last-child>div]:justify-end [&_td:nth-child(n+3):not(:last-child)>div]:justify-center [&_th:last-child]:text-end [&_th:not(:nth-child(1n+3))]:text-start",
      className,
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 whitespace-nowrap bg-default-100 px-3 align-middle font-semibold text-foreground-500 text-xs uppercase first:rounded-l-lg last:rounded-r-lg",
      className,
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "relative h-10 whitespace-nowrap px-3 py-2 align-middle font-normal text-small data-[selected=true]:text-default-foreground group-data-[odd=true]:before:bg-default-100 group-data-[odd=true]:before:opacity-100 [&:has([role=checkbox])]:pr-0",
      className,
    )}
    suppressHydrationWarning
    {...props}
  >
    <div className="flex min-w-max">{children}</div>
  </td>
))
TableCell.displayName = "TableCell"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
}
