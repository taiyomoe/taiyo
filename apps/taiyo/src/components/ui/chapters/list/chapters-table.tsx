"use client"
import { Spinner } from "@nextui-org/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table"
import type { ChaptersListItem } from "@taiyomoe/types"
import { UserUtils } from "@taiyomoe/utils"
import { LANGUAGES_PT } from "@taiyomoe/utils/i18n"
import { useAtom, useAtomValue } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { DateTime } from "luxon"
import Image from "next/image"
import { isDate, isObject } from "radash"
import { type Key, useCallback, useMemo } from "react"
import {
  chaptersListInitialDataAtom,
  chaptersListLoadingAtom,
  chaptersListSelectedKeysAtom,
  chaptersListVisibleColumnsAtom,
} from "~/atoms/chaptersList.atoms"
import { CountryFlag } from "~/components/ui/CountryFlag"
import { useChaptersList } from "~/hooks/useChaptersList"

export const columns = [
  { name: "Id", uid: "id" },
  { name: "Data de upload", uid: "createdAt" },
  { name: "Última atualização", uid: "updatedAt" },
  { name: "Data de remoção", uid: "deletedAt" },
  { name: "Título", uid: "title" },
  { name: "Número", uid: "number" },
  { name: "Volume", uid: "volume" },
  { name: "Língua", uid: "language" },
  { name: "Classificação", uid: "contentRating" },
  { name: "Flag", uid: "flag" },
  { name: "Uploader", uid: "uploader" },
  { name: "Scans", uid: "scans" },
  { name: "Obra", uid: "media" },
  { name: "Deletado por", uid: "deleter" },
  { name: "Ações", uid: "actions" },
]

type Props = {
  initialData: { chapters: ChaptersListItem[]; totalPages: number }
}

export const ChaptersTable = ({ initialData }: Props) => {
  useHydrateAtoms([[chaptersListInitialDataAtom, initialData]])

  const visibleColumns = useAtomValue(chaptersListVisibleColumnsAtom)
  const isLoading = useAtomValue(chaptersListLoadingAtom)
  const [selectedKeys, setSelectedKeys] = useAtom(chaptersListSelectedKeysAtom)
  const { items } = useChaptersList()
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    )
  }, [visibleColumns])

  const renderCell = useCallback((scan: ChaptersListItem, columnKey: Key) => {
    const value = scan[columnKey as keyof ChaptersListItem]

    if (!value) return ""

    if (isDate(value)) {
      return (
        <p className="">
          {DateTime.fromJSDate(value).toFormat("dd/MM/yyyy HH:mm")}
        </p>
      )
    }

    if (
      ["uploader", "deleter"].includes(columnKey as string) &&
      isObject(value)
    ) {
      const uploader = value as ChaptersListItem["uploader"]

      return (
        <div className="flex  items-center gap-2">
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
    }

    if (columnKey === "language") {
      const language = value as ChaptersListItem["language"]

      return (
        <div className="flex  items-center gap-2">
          <CountryFlag language={language} size={24} />
          <p>{LANGUAGES_PT[language]}</p>
        </div>
      )
    }

    // if (columnKey === "actions") {
    //   return <ScansTableSingleActions scan={scan} />
    // }

    return <p className="">{String(value)}</p>
  }, [])

  console.log("items", items)
  console.log("selectedKeys", selectedKeys)
  console.log("isLoading", isLoading)
  console.log("headerColumns", headerColumns)

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Capítulos</p>
      <Table
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        // topContent={<ScansTableTopContent />}
        // topContentPlacement="outside"
        // bottomContent={<ScansTableBottomContent />}
        // bottomContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        aria-label="Chapters list"
        isStriped
      >
        <TableHeader columns={headerColumns}>
          {(c) => (
            <TableColumn
              key={c.uid}
              className="uppercase"
              align={
                ["createdAt"].includes(c.uid)
                  ? "start"
                  : ["actions"].includes(c.uid)
                    ? "end"
                    : "center"
              }
            >
              {c.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={isLoading ? [] : items}
          isLoading={isLoading}
          emptyContent="Nenhuma scan encontrada"
          loadingContent={<Spinner size="lg" />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell className="[&:not(:first-child)]:px-6 [&:nth-child(2)]:px-3">
                  <div className="min-w-max">{renderCell(item, columnKey)}</div>
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
