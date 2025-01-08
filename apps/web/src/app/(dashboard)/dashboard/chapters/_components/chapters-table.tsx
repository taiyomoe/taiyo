"use client"

import { CHAPTERS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { AppRouter } from "@taiyomoe/trpc"
import { useQueryStates } from "nuqs"
import { useEffect } from "react"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useChaptersListStore } from "~/stores/use-chapters-list-store"
import { api } from "~/trpc/react"
import { keepPreviousData } from "~/utils/keep-previous-data"
import { normalizeSearchParams } from "~/utils/normalize-search-params"
import { chaptersSearchParams } from "./chapters-search-params"
import { columns } from "./chapters-table-columns"
import { ChaptersTableEmptyContent } from "./chapters-table-empty-content"
import { ChaptersTableFilters } from "./chapters-table-filters"
import { ChaptersTableMultipleActions } from "./chapters-table-multiple-actions"

type Props = {
  initialData: Awaited<ReturnType<AppRouter["chapters"]["getList"]>>
}

export const ChaptersTable = ({ initialData }: Props) => {
  const [_, setSearchParams] = useQueryStates(chaptersSearchParams)
  const { input, setSort, setPage, setPerPage } = useChaptersListStore()
  const {
    data: { chapters: items, totalPages, totalCount } = initialData,
    isFetching,
  } = api.chapters.getList.useQuery(input, {
    placeholderData: keepPreviousData(initialData),
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to this trigger when the input changes
  useEffect(() => {
    const normalized = normalizeSearchParams(chaptersSearchParams, input)

    setSearchParams(normalized)
  }, [input])

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
      page={input.page}
      perPage={input.perPage}
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
