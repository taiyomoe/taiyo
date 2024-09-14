import type { MediasListItem } from "@taiyomoe/types"
import type { ColumnDef } from "@tanstack/react-table"
import {
  // actionsColumn,
  selectableColumn,
} from "~/components/generics/data-table/data-table-presets"
import { TableCellBoolean } from "~/components/tables/table-cell-boolean"
import { TableCellCover } from "~/components/tables/table-cell-cover"
import { TableCellDate } from "~/components/tables/table-cell-date"
import { TableCellGenres } from "~/components/tables/table-cell-genres"
import { TableCellId } from "~/components/tables/table-cell-id"
import { TableCellTags } from "~/components/tables/table-cell-tags"
import { TableCellUser } from "~/components/tables/table-cell-user"
// import { ScansTableSingleActions } from "./scans-table-single-actions"

export const columns: ColumnDef<MediasListItem>[] = [
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
    cell: ({ getValue }) => <TableCellDate date={getValue<Date>()} />,
  },
  {
    accessorKey: "startDate",
    header: "Data de início",
    enableMultiSort: true,
    cell: ({ getValue }) => (
      <TableCellDate date={getValue<Date>()} format="D" />
    ),
  },
  {
    accessorKey: "endDate",
    header: "Data de término",
    enableMultiSort: true,
    cell: ({ getValue }) => (
      <TableCellDate date={getValue<Date>()} format="D" />
    ),
  },
  {
    accessorKey: "mainCoverId",
    header: "Cover principal",
    cell: ({ row }) => (
      <TableCellCover
        mediaId={row.original.id}
        coverId={row.original.mainCoverId}
      />
    ),
  },
  { accessorKey: "mainTitle", header: "Título principal" },
  { accessorKey: "synopsis", header: "Sinopse" },
  {
    accessorKey: "contentRating",
    header: "Classificação",
    enableMultiSort: true,
  },
  {
    accessorKey: "oneShot",
    header: "One-Shot",
    enableMultiSort: true,
    cell: ({ getValue }) => <TableCellBoolean value={getValue<boolean>()} />,
  },
  { accessorKey: "trailer", header: "Trailer", enableMultiSort: true },
  { accessorKey: "type", header: "Tipo", enableMultiSort: true },
  { accessorKey: "status", header: "Status", enableMultiSort: true },
  { accessorKey: "source", header: "Fonte", enableMultiSort: true },
  { accessorKey: "demography", header: "Demografia", enableMultiSort: true },
  { accessorKey: "countryOfOrigin", header: "Origem", enableMultiSort: true },
  {
    accessorKey: "genres",
    header: "Gêneros",
    cell: ({ getValue }) => (
      <TableCellGenres genres={getValue<MediasListItem["genres"]>()} />
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ getValue }) => (
      <TableCellTags tags={getValue<MediasListItem["tags"]>()} />
    ),
  },
  { accessorKey: "flag", header: "Flag", enableMultiSort: true },
  { accessorKey: "titlesCount", header: "Títulos" },
  { accessorKey: "coversCount", header: "Covers" },
  { accessorKey: "bannersCount", header: "Banners" },
  { accessorKey: "chaptersCount", header: "Capítulos" },
  {
    accessorKey: "creator",
    header: "Criador",
    cell: ({ getValue }) => (
      <TableCellUser user={getValue<MediasListItem["creator"]>()} />
    ),
  },
  {
    accessorKey: "deleter",
    header: "Deletado por",
    cell: ({ getValue }) => (
      <TableCellUser user={getValue<MediasListItem["deleter"]>()} />
    ),
  },
  // actionsColumn(({ row }) => <ScansTableSingleActions scan={row.original} />),
]
