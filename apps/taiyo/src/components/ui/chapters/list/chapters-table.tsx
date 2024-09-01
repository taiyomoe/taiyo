"use client"

import { CHAPTERS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { ChaptersListItem } from "@taiyomoe/types"
import { useRef } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useChaptersListStore } from "~/stores/chaptersList.store"
import { api } from "~/trpc/react"
import { columns } from "./chapters-table-columns"
import { ChaptersTableFilters } from "./chapters-table-filters"

type Props = {
  initialData: { chapters: ChaptersListItem[]; totalPages: number }
}

export const ChaptersTable = ({ initialData }: Props) => {
  const { page, perPage, query, setPage, setPerPage } = useChaptersListStore()
  const previousQuery = useRef(query)

  const {
    data: { chapters: items, totalPages },
    isFetching,
    refetch,
  } = api.chapters.getList.useQuery(
    { query, page, perPage },
    { initialData, refetchOnMount: false, enabled: false },
  )

  const handleSearch = useDebounceCallback(async () => {
    await refetch()
  }, 300)

  if (previousQuery.current !== query) {
    previousQuery.current = query
    handleSearch()
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<ChaptersTableFilters />}
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
