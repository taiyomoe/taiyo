"use client"

import { CHAPTERS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { ChaptersListItem } from "@taiyomoe/types"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useChaptersListStore } from "~/stores/chaptersList.store"
import { api } from "~/trpc/react"
import { columns } from "./chapters-table-columns"
import { ChaptersTableFilters } from "./chapters-table-filters"
import { ChaptersTableMultipleActions } from "./chapters-table-multiple-actions"

type Props = {
  initialData: { chapters: ChaptersListItem[]; totalPages: number }
}

export const ChaptersTable = ({ initialData }: Props) => {
  const { query, page, perPage, setPage, setPerPage } = useChaptersListStore()
  const {
    data: { chapters: items, totalPages },
    isFetching,
  } = api.chapters.getList.useQuery(
    { query, page, perPage },
    { initialData, refetchOnMount: false },
  )

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<ChaptersTableFilters />}
      multipleActions={<ChaptersTableMultipleActions />}
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
      isLoading={isFetching}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
    />
  )
}
