import type { Task, TaskStatus } from "@taiyomoe/db"
import type { ColumnDef } from "@tanstack/react-table"
import { TableCellDate } from "~/components/tables/table-cell-date"
import { TableCellId } from "~/components/tables/table-cell-id"
import { TableCellJson } from "~/components/tables/table-cell-json"
import { TableCellTaskStatus } from "~/components/tables/table-cell-task-status"

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => <TableCellId id={getValue<string>()} />,
  },
  {
    accessorKey: "createdAt",
    header: "Data de criação",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellDate date={getValue<Date>()} />,
  },
  {
    accessorKey: "updatedAt",
    header: "Última atualização",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellDate date={getValue<Date>()} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableMultiSort: true,
    cell: ({ getValue }) => (
      <TableCellTaskStatus status={getValue<TaskStatus>()} />
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    enableMultiSort: true,
    cell: ({ getValue }) => <p>{getValue<string>()}</p>,
  },
  {
    accessorKey: "payload",
    header: "Payload",
    cell: ({ getValue }) => (
      <TableCellJson json={getValue<Record<string, unknown>>()} />
    ),
  },
]
