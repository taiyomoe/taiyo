"use client"

import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { Selection } from "@nextui-org/react"
import { Spinner } from "@nextui-org/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table"
import type { ScansList } from "@taiyomoe/types"
import { useAtomValue } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { EllipsisIcon } from "lucide-react"
import { type Key, useCallback, useMemo, useState } from "react"
import {
  scansListInitialItemsAtom,
  scansListLoadingAtom,
  scansListVisibleColumnsAtom,
} from "~/atoms/scansList.atoms"
import { ScansTableTopContent } from "~/components/ui/scans/scans-table-top-content"
import { useScansList } from "~/hooks/useScansList"

export const columns = [
  { name: "Id", uid: "id" },
  { name: "Nome", uid: "name" },
  { name: "Capítulos", uid: "chapters" },
  { name: "Membros", uid: "members" },
  { name: "Ações", uid: "actions" },
]

type Props = {
  initialItems: ScansList
}

export const ScansTable = ({ initialItems }: Props) => {
  useHydrateAtoms([[scansListInitialItemsAtom, initialItems]])

  const visibleColumns = useAtomValue(scansListVisibleColumnsAtom)
  const isLoading = useAtomValue(scansListLoadingAtom)
  const { items } = useScansList()
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    )
  }, [visibleColumns])

  const renderCell = useCallback((scan: ScansList[number], columnKey: Key) => {
    const value = scan[columnKey as keyof ScansList[number]]

    if (columnKey === "actions") {
      return (
        <div className="relative flex items-center justify-end gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <EllipsisIcon className="text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>View</DropdownItem>
              <DropdownItem>Edit</DropdownItem>
              <DropdownItem>Delete</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )
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
