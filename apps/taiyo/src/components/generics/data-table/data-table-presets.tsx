import { Checkbox } from "@nextui-org/checkbox"
import type { ColumnDef } from "@tanstack/react-table"

export const selectableColumn = <TData,>(): ColumnDef<TData> => ({
  id: "select",
  header: ({ table }) => (
    <Checkbox
      isSelected={table.getIsAllPageRowsSelected()}
      isIndeterminate={table.getIsSomePageRowsSelected()}
      onValueChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      isSelected={row.getIsSelected()}
      onValueChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
})

export const actionsColumn = <TData,>(): ColumnDef<TData> => ({
  accessorKey: "actions",
  header: "Ações",
  enableHiding: false,
})
