"use client"

import { CHAPTERS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { ChaptersListItem } from "@taiyomoe/types"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useChaptersListStore } from "~/stores/chaptersList.store"
import { api } from "~/trpc/react"
import { columns } from "./chapters-table-columns"
import { ChaptersTableEmptyContent } from "./chapters-table-empty-content"
import { ChaptersTableFilters } from "./chapters-table-filters"
import { ChaptersTableMultipleActions } from "./chapters-table-multiple-actions"

type Props = {
  initialData: {
    chapters: ChaptersListItem[]
    totalPages: number
    totalCount: number
  }
}

export const ChaptersTable = ({ initialData }: Props) => {
  const { filter, sort, page, perPage, setSort, setPage, setPerPage } =
    useChaptersListStore()
  const {
    data: { chapters: items, totalPages, totalCount },
    isFetching,
  } = api.chapters.getList.useQuery(
    { filter, sort, page, perPage },
    { initialData, refetchOnMount: false },
  )

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<ChaptersTableFilters />}
      multipleActions={<ChaptersTableMultipleActions />}
      emptyContent={<ChaptersTableEmptyContent />}
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
      totalCount={totalCount}
      isLoading={isFetching}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      onSort={setSort}
    />
  )
}
