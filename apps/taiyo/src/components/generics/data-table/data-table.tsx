import { Spinner } from "@nextui-org/spinner"
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { type ReactNode, useRef, useState } from "react"
import { TableBodyEmpty } from "~/components/tables/table-body-empty"
import { TableColumnVisibilityDropdown } from "~/components/tables/table-column-visibility-dropdown"
import { TableHeadSorted } from "~/components/tables/table-head-sorted"
import { TablePagination } from "~/components/tables/table-pagination"
import { AnimatedPresence } from "~/components/ui/animated-presence"
import { DataTableContext } from "./data-table-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filters: ReactNode
  multipleActions: ReactNode
  emptyContent: ReactNode
  initialVisibility: Partial<Record<keyof TData, boolean>>
  page: number
  perPage: number
  perPageChoices: number[]
  totalPages: number
  totalCount: number
  isLoading: boolean
  onPageChange: (newPage: number) => void
  onPerPageChange: (newPerPage: number) => void
  onSort: (newSortingState: SortingState) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  multipleActions,
  emptyContent,
  initialVisibility,
  page,
  perPage,
  perPageChoices,
  totalPages,
  totalCount,
  isLoading,
  onPageChange,
  onPerPageChange,
  onSort,
}: DataTableProps<TData, TValue>) {
  const previousData = useRef(data)
  const previousTotalPages = useRef(totalPages)
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: isLoading ? previousData.current : data,
    columns,
    pageCount: isLoading ? previousTotalPages.current : totalPages,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const newSortingValue =
        updater instanceof Function ? updater(sorting) : updater

      setSorting(newSortingValue)
      onSort(newSortingValue)
    },
    onPaginationChange: (updater) => {
      const newValues = functionalUpdate(updater, {
        pageIndex: page - 1,
        pageSize: perPage,
      })

      if (newValues.pageIndex !== page - 1) {
        table.resetRowSelection()
        onPageChange(newValues.pageIndex + 1)
      }

      if (newValues.pageSize !== perPage) {
        onPerPageChange(newValues.pageSize)
      }
    },
    initialState: {
      columnVisibility: initialVisibility as VisibilityState,
    },
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: perPage,
      },
    },
  })
  const hasData = table.getRowModel().rows?.length > 0
  const selectedRowsCount = table.getSelectedRowModel().rows.length

  if (!isLoading && data !== previousData.current) {
    previousData.current = data
    previousTotalPages.current = totalPages
  }

  return (
    <DataTableContext.Provider value={{ table }}>
      <div className="space-y-4">
        {filters}
        <div className="flex justify-end gap-4">
          {isLoading && <Spinner size="sm" />}
          <AnimatedPresence
            active={table.getSelectedRowModel().rows.length > 0}
          >
            {multipleActions}
          </AnimatedPresence>
          <TableColumnVisibilityDropdown />
        </div>
        <Table>
          <TableHeader>
            {hasData &&
              table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((h) => {
                    if (h.column.getCanMultiSort()) {
                      return (
                        <TableHeadSorted key={h.id} column={h.column}>
                          {flexRender(
                            h.column.columnDef.header,
                            h.getContext(),
                          )}
                        </TableHeadSorted>
                      )
                    }

                    return (
                      <TableHead key={h.id}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
          </TableHeader>
          {hasData && (
            <TableBody>
              {table.getRowModel().rows.map((r) => (
                <TableRow
                  key={r.id}
                  data-state={r.getIsSelected() && "selected"}
                >
                  {r.getVisibleCells().map((c) => (
                    <TableCell key={c.id}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          )}
          {!hasData && (
            <TableBodyEmpty colSpan={columns.length}>
              {emptyContent}
            </TableBodyEmpty>
          )}
        </Table>
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-default-400 text-sm">
            {totalCount === 0 ? "Nenhum resultado" : `${totalCount} resultados`}
            {selectedRowsCount > 0 && (
              <span className="text-default-400 text-sm">
                , {selectedRowsCount}{" "}
                {selectedRowsCount === 1 ? "selecionado" : "selecionados"}
              </span>
            )}
          </p>
          <div className="flex md:justify-end">
            <TablePagination
              page={table.getState().pagination.pageIndex + 1}
              perPage={table.getState().pagination.pageSize}
              totalPages={table.getPageCount()}
              perPageChoices={perPageChoices}
              onPageChange={(newPage) => table.setPageIndex(newPage - 1)}
              onPerPageChange={table.setPageSize}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </DataTableContext.Provider>
  )
}
