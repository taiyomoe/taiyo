import type { ScansListItem } from "@taiyomoe/types"
import type { ColumnDef } from "@tanstack/react-table"
import {
  actionsColumn,
  selectableColumn,
} from "~/components/generics/data-table/data-table-presets"
import { TableCellDate } from "~/components/tables/table-cell-date"
import { TableCellId } from "~/components/tables/table-cell-id"
import { TableCellUrl } from "~/components/tables/table-cell-url"
import { TableCellUser } from "~/components/tables/table-cell-user"
import { ScansTableSingleActions } from "./scans-table-single-actions"

export const columns: ColumnDef<ScansListItem>[] = [
  selectableColumn(),
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
    accessorKey: "deletedAt",
    header: "Data de remoção",
    enableMultiSort: true,
    cell: ({ getValue }) => (
      <TableCellDate date={getValue<ScansListItem["deletedAt"]>()} />
    ),
  },
  { accessorKey: "name", header: "Nome", enableMultiSort: true },
  { accessorKey: "description", header: "Descrição", enableMultiSort: true },
  {
    accessorKey: "website",
    header: "Website",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellUrl url={getValue<string>()} />,
  },
  {
    accessorKey: "discord",
    header: "Discord",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellUrl url={getValue<string>()} />,
  },
  {
    accessorKey: "twitter",
    header: "Twitter",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellUrl url={getValue<string>()} />,
  },
  {
    accessorKey: "facebook",
    header: "Facebook",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellUrl url={getValue<string>()} />,
  },
  {
    accessorKey: "instagram",
    header: "Instagram",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellUrl url={getValue<string>()} />,
  },
  {
    accessorKey: "telegram",
    header: "Telegram",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellUrl url={getValue<string>()} />,
  },
  {
    accessorKey: "youtube",
    header: "YouTube",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellUrl url={getValue<string>()} />,
  },
  { accessorKey: "email", header: "Email", enableMultiSort: true },
  {
    accessorKey: "creator",
    header: "Criador",
    cell: ({ getValue }) => (
      <TableCellUser user={getValue<ScansListItem["creator"]>()} />
    ),
  },
  {
    accessorKey: "deleter",
    header: "Deletado por",
    cell: ({ getValue }) => (
      <TableCellUser user={getValue<ScansListItem["deleter"]>()} />
    ),
  },
  actionsColumn(({ row }) => <ScansTableSingleActions scan={row.original} />),
]
