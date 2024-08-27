import { Checkbox } from "@nextui-org/checkbox"
import type { ChaptersListItem } from "@taiyomoe/types"
import { UserUtils } from "@taiyomoe/utils"
import { LANGUAGES_PT } from "@taiyomoe/utils/i18n"
import type { ColumnDef } from "@tanstack/react-table"
import { DateTime } from "luxon"
import Image from "next/image"
import { CountryFlag } from "~/components/ui/CountryFlag"

export const columns: ColumnDef<ChaptersListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        isSelected={
          table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()
        }
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
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "createdAt",
    header: "Data de upload",
    cell: ({ getValue }) =>
      DateTime.fromJSDate(getValue<Date>()).toFormat("dd/MM/yyyy HH:mm"),
  },
  {
    accessorKey: "updatedAt",
    header: "Última atualização",
    cell: ({ getValue }) =>
      DateTime.fromJSDate(getValue<Date>()).toFormat("dd/MM/yyyy HH:mm"),
  },
  {
    accessorKey: "deletedAt",
    header: "Data de remoção",
    cell: ({ getValue }) => {
      const value = getValue<ChaptersListItem["deletedAt"]>()

      if (!value) return null

      return DateTime.fromJSDate(value).toFormat("dd/MM/yyyy HH:mm")
    },
  },
  { accessorKey: "title", header: "Título" },
  { accessorKey: "number", header: "Número" },
  { accessorKey: "volume", header: "Volume" },
  {
    accessorKey: "language",
    header: "Língua",
    cell: ({ getValue }) => {
      const language = getValue<ChaptersListItem["language"]>()

      return (
        <div className="flex items-center gap-2">
          <CountryFlag language={language} size={24} />
          <p>{LANGUAGES_PT[language]}</p>
        </div>
      )
    },
  },
  { accessorKey: "contentRating", header: "Classificação" },
  { accessorKey: "flag", header: "Flag" },
  {
    accessorKey: "uploader",
    header: "Uploader",
    cell: ({ getValue }) => {
      const uploader = getValue<ChaptersListItem["uploader"]>()

      return (
        <div className="flex items-center gap-2">
          <Image
            src={UserUtils.getAvatarUrl(uploader)}
            className="rounded-full"
            width={24}
            height={24}
            alt={uploader.name!}
          />
          <p className="font-medium">{uploader.name}</p>
        </div>
      )
    },
  },
  { accessorKey: "scans", header: "Scans" },
  { accessorKey: "media", header: "Obra" },
  {
    accessorKey: "deleter",
    header: "Deletado por",
    cell: ({ getValue }) => {
      const deleter = getValue<ChaptersListItem["deleter"]>()

      if (!deleter) return null

      return (
        <div className="flex items-center gap-2">
          <Image
            src={UserUtils.getAvatarUrl(deleter)}
            className="rounded-full"
            width={24}
            height={24}
            alt={deleter.name!}
          />
          <p className="font-medium">{deleter.name}</p>
        </div>
      )
    },
  },
  { accessorKey: "actions", header: "Ações", enableHiding: false },
]
