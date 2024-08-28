"use client"

import { CHAPTERS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { ChaptersListItem } from "@taiyomoe/types"
import { useHydrateAtoms } from "jotai/utils"
import { chaptersListInitialDataAtom } from "~/atoms/chaptersList.atoms"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useChaptersList } from "~/hooks/useChaptersList"
import { columns } from "./chapters-table-columns"

type Props = {
  initialData: { chapters: ChaptersListItem[]; totalPages: number }
}

export const ChaptersTableNew = ({ initialData }: Props) => {
  useHydrateAtoms([[chaptersListInitialDataAtom, initialData]])

  const {
    items,
    page,
    perPage,
    totalPages,
    isLoading,
    handlePageChange,
    handlePerPageChange,
  } = useChaptersList()

  return (
    <DataTable
      columns={columns}
      data={items}
      initialVisibility={{
        id: false,
        updatedAt: false,
        deletedAt: false,
        flag: false,
        deleter: false,
      }}
      page={page}
      perPage={perPage}
      perPageChoices={CHAPTERS_LIST_PER_PAGE_CHOICES}
      totalPages={totalPages}
      isLoading={isLoading}
      onPageChange={handlePageChange}
      onPerPageChange={handlePerPageChange}
    />
  )
}
