"use client"

import {
  MEDIAS_LIST_PER_PAGE_CHOICES,
  MEDIAS_LIST_QUERYABLE_FIELDS,
} from "@taiyomoe/constants"
import type { MediasListItem } from "@taiyomoe/types"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useMediasListStore } from "~/stores/mediasList.store"
import { api } from "~/trpc/react"
import { columns } from "./medias-table-columns"
import { MediasTableEmptyContent } from "./medias-table-empty-content"
import { MediasTableFilters } from "./medias-table-filters"

type Props = {
  initialData: {
    medias: MediasListItem[]
    totalPages: number
    totalCount: number
  }
}

export const MediasTable = ({ initialData }: Props) => {
  const {
    query,
    filter,
    sort,
    page,
    perPage,
    setQuery,
    setSort,
    setPage,
    setPerPage,
  } = useMediasListStore()
  const {
    data: { medias: items, totalPages, totalCount },
    isFetching,
  } = api.medias.getList.useQuery(
    { query, filter, sort, page, perPage },
    { initialData, refetchOnMount: false },
  )

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<MediasTableFilters />}
      multipleActions={<p>Azerty</p>}
      emptyContent={<MediasTableEmptyContent />}
      initialVisibility={{
        id: false,
        updatedAt: false,
        deletedAt: false,
        startDate: false,
        endDate: false,
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
      page={page}
      perPage={perPage}
      perPageChoices={MEDIAS_LIST_PER_PAGE_CHOICES}
      queryableFields={MEDIAS_LIST_QUERYABLE_FIELDS.options}
      totalPages={totalPages}
      totalCount={totalCount}
      isLoading={isFetching}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      onSort={setSort}
      onQueryChange={setQuery}
    />
  )
}
