"use client"

import { MEDIAS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { AppRouter } from "@taiyomoe/trpc"
import { useQueryStates } from "nuqs"
import { useEffect } from "react"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useMediasListStore } from "~/stores/use-medias-list-store"
import { api } from "~/trpc/react"
import { keepPreviousData } from "~/utils/keep-previous-data"
import { normalizeSearchParams } from "~/utils/normalize-search-params"
import { mediasSearchParams } from "./medias-search-params"
import { columns } from "./medias-table-columns"
import { MediasTableEmptyContent } from "./medias-table-empty-content"
import { MediasTableFilters } from "./medias-table-filters"
import { MediasTableMultipleActions } from "./medias-table-multiple-actions"

type Props = {
  initialData: Awaited<ReturnType<AppRouter["medias"]["getList"]>>
}

export const MediasTable = ({ initialData }: Props) => {
  const [_, setSearchParams] = useQueryStates(mediasSearchParams)
  const { input, setSort, setPage, setPerPage } = useMediasListStore()
  const {
    data: { medias: items, totalPages, totalCount } = initialData,
    isFetching,
  } = api.medias.getList.useQuery(input, {
    placeholderData: keepPreviousData(initialData),
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to this trigger when the input changes
  useEffect(() => {
    const normalized = normalizeSearchParams(mediasSearchParams, input)

    setSearchParams(normalized)
  }, [input])

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<MediasTableFilters />}
      multipleActions={<MediasTableMultipleActions />}
      emptyContent={<MediasTableEmptyContent />}
      initialVisibility={{
        id: false,
        updatedAt: false,
        deletedAt: false,
        startDate: false,
        endDate: false,
        mainCoverId: false,
        synopsis: false,
        contentRating: false,
        oneShot: false,
        trailer: false,
        status: false,
        source: false,
        demography: false,
        countryOfOrigin: false,
        genres: false,
        tags: false,
        flag: false,
        deleter: false,
      }}
      page={input.page}
      perPage={input.perPage}
      perPageChoices={MEDIAS_LIST_PER_PAGE_CHOICES}
      totalPages={totalPages}
      totalCount={totalCount}
      isLoading={isFetching}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      onSort={setSort}
    />
  )
}
