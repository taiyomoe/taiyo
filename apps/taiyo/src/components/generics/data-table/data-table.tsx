import {
  type ColumnDef,
  type VisibilityState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { type ReactNode, useMemo } from "react"
import { TableBodyEmpty } from "~/components/tables/table-body-empty"
import { TableBodyLoading } from "~/components/tables/table-body-loading"
import { TableColumnVisibilityDropdown } from "~/components/tables/table-column-visibility-dropdown"
import { TablePagination } from "~/components/tables/table-pagination"
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
  initialVisibility: Partial<Record<keyof TData, boolean>>
  page: number
  perPage: number
  perPageChoices: number[]
  totalPages: number
  isLoading: boolean
  onPageChange: (newPage: number) => void
  onPerPageChange: (newPerPage: number) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  initialVisibility,
  page,
  perPage,
  perPageChoices,
  totalPages,
  isLoading,
  onPageChange,
  onPerPageChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
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
      pagination: {
        pageIndex: page - 1,
        pageSize: perPage,
      },
    },
  })
  const status = useMemo(() => {
    if (isLoading) return "loading"
    if (table.getRowModel().rows?.length === 0) return "empty"

    return "data"
  }, [isLoading, table.getRowModel])

  return (
    <div className="space-y-4">
      {filters}
      <div className="flex justify-end">
        <TableColumnVisibilityDropdown table={table} />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        {status === "data" && (
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
        {status === "empty" && <TableBodyEmpty colSpan={columns.length} />}
        {status === "loading" && (
          <TableBodyLoading perPage={perPage} colSpan={columns.length} />
        )}
      </Table>
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
  )
}
