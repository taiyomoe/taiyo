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
import type { ScansListItem } from "@taiyomoe/types"
import { useAtom, useAtomValue } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { type Key, useCallback, useMemo } from "react"
import {
  scansListInitialDataAtom,
  scansListLoadingAtom,
  scansListSelectedKeysAtom,
  scansListVisibleColumnsAtom,
} from "~/atoms/scansList.atoms"
import { useScansList } from "~/hooks/useScansList"
import { ScansTableBottomContent } from "./scans-table-bottom-content"
import { ScansTableSingleActions } from "./scans-table-single-actions"
import { ScansTableTopContent } from "./scans-table-top-content"

export const columns = [
  { name: "Id", uid: "id" },
  { name: "Nome", uid: "name" },
  { name: "Capítulos", uid: "chapters" },
  { name: "Membros", uid: "members" },
  { name: "Ações", uid: "actions" },
]

type Props = {
  initialData: { scans: ScansListItem[]; totalPages: number }
}

export const ScansTable = ({ initialData }: Props) => {
  useHydrateAtoms([[scansListInitialDataAtom, initialData]])

  const visibleColumns = useAtomValue(scansListVisibleColumnsAtom)
  const isLoading = useAtomValue(scansListLoadingAtom)
  const [selectedKeys, setSelectedKeys] = useAtom(scansListSelectedKeysAtom)
  const { items } = useScansList()
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    )
  }, [visibleColumns])

  const renderCell = useCallback((scan: ScansListItem, columnKey: Key) => {
    const value = scan[columnKey as keyof ScansListItem]

    if (columnKey === "actions") {
      return <ScansTableSingleActions scan={scan} />
    }

    return value
  }, [])

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Scans</p>
      <div>
        <Table
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          topContent={<ScansTableTopContent />}
          topContentPlacement="outside"
          bottomContent={<ScansTableBottomContent />}
          bottomContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          aria-label="Scans list"
          isStriped
        >
          <TableHeader columns={headerColumns}>
            {(c) => (
              <TableColumn
                key={c.uid}
                className="uppercase"
                align={
                  c.uid === "actions"
                    ? "end"
                    : ["chapters", "members"].includes(c.uid)
                      ? "center"
                      : "start"
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
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
