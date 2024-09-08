import type { ChaptersListItem } from "@taiyomoe/types"
import type { ColumnDef } from "@tanstack/react-table"
import {
  actionsColumn,
  selectableColumn,
} from "~/components/generics/data-table/data-table-presets"
import { TableCellDate } from "~/components/tables/table-cell-date"
import { TableCellLanguage } from "~/components/tables/table-cell-language"
import { TableCellMedia } from "~/components/tables/table-cell-media"
import { TableCellScans } from "~/components/tables/table-cell-scans"
import { TableCellUser } from "~/components/tables/table-cell-user"
import { ChaptersTableSingleActions } from "./chapters-table-single-actions"

export const columns: ColumnDef<ChaptersListItem>[] = [
  selectableColumn(),
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "createdAt",
    header: "Data de upload",
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
    cell: ({ getValue }) => {
      const value = getValue<ChaptersListItem["deletedAt"]>()

      if (!value) return null

      return <TableCellDate date={value} />
    },
  },
  {
    accessorKey: "title",
    header: "Título",
    enableMultiSort: true,
  },
  {
    accessorKey: "number",
    header: "Número",
    enableMultiSort: true,
  },
  {
    accessorKey: "volume",
    header: "Volume",
    enableMultiSort: true,
  },
  {
    accessorKey: "language",
    header: "Língua",
    enableMultiSort: true,
    cell: ({ getValue }) => (
      <TableCellLanguage language={getValue<ChaptersListItem["language"]>()} />
    ),
  },
  {
    accessorKey: "contentRating",
    header: "Classificação",
    enableMultiSort: true,
  },
  {
    accessorKey: "flag",
    header: "Flag",
    enableMultiSort: true,
  },
  {
    accessorKey: "uploader",
    header: "Uploader",
    enableMultiSort: true,
    cell: ({ getValue }) => (
      <TableCellUser user={getValue<ChaptersListItem["uploader"]>()} />
    ),
  },
  {
    accessorKey: "scans",
    header: "Scans",
    cell: ({ getValue }) => (
      <TableCellScans scans={getValue<ChaptersListItem["scans"]>()} />
    ),
  },
  {
    accessorKey: "media",
    header: "Obra",
    enableMultiSort: true,
    cell: ({ getValue }) => (
      <TableCellMedia media={getValue<ChaptersListItem["media"]>()} />
    ),
  },
  {
    accessorKey: "deleter",
    header: "Deletado por",
    enableMultiSort: true,
    cell: ({ getValue }) => (
      <TableCellUser user={getValue<ChaptersListItem["deleter"]>()} />
    ),
  },
  actionsColumn(({ row }) => (
    <ChaptersTableSingleActions chapter={row.original} />
  )),
]
