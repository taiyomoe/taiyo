import type { Column, RowData } from "@tanstack/react-table"
import type { ReactNode } from "react"

type Props<TData, TValue> = {
  column: Column<TData, TValue>
  children: ReactNode
}

export const TableHeadSorted = <TData extends RowData, TValue>({
  column,
  children,
}: Props<TData, TValue>) => {
  const currentSort = column.getIsSorted()
  const currentSortPosition = column.getSortIndex() + 1

  const handleClick = () => {
    if (currentSort === "desc") {
      column.clearSorting()

      return
    }

    column.toggleSorting(currentSort === "asc", true)
  }

  return (
    <th
      className="h-10 select-none bg-default-100 px-3 first:rounded-l-lg last:rounded-r-lg hover:cursor-pointer [&:hover>div]:text-default-600 [&:not(:nth-child(1n+3))>div]:justify-start"
      onClick={handleClick}
    >
      <div className="flex items-center justify-center gap-1 whitespace-nowrap font-semibold text-foreground-500 text-xs uppercase transition-colors">
        {children}
        {currentSort && (
          <div className="rounded-full bg-default-200 px-2 py-1 text-[10px]">
            {currentSort} {currentSortPosition}
          </div>
        )}
      </div>
    </th>
  )
}
