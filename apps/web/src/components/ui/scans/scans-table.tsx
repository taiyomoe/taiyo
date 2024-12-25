"use client"

import {
  SCANS_LIST_PER_PAGE_CHOICES,
  SCANS_LIST_QUERYABLE_FIELDS,
} from "@taiyomoe/constants"
import type { ScansListItem } from "@taiyomoe/types"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useScansListStore } from "~/stores/scansList.store"
import { api } from "~/trpc/react"
import { columns } from "./scans-table-columns"
import { ScansTableEmptyContent } from "./scans-table-empty-content"
import { ScansTableFilters } from "./scans-table-filters"
import { ScansTableMultipleActions } from "./scans-table-multiple-actions"

type Props = {
  initialData: {
    scans: ScansListItem[]
    totalPages: number
    totalCount: number
  }
}

export const ScansTable = ({ initialData }: Props) => {
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
  } = useScansListStore()
  const {
    data: { scans: items, totalPages, totalCount },
    isFetching,
  } = api.scans.getList.useQuery(
    { query, filter, sort, page, perPage },
    { initialData, refetchOnMount: false },
  )

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<ScansTableFilters />}
      multipleActions={<ScansTableMultipleActions />}
      emptyContent={<ScansTableEmptyContent />}
      initialVisibility={{
        id: false,
        updatedAt: false,
        deletedAt: false,
        description: false,
        twitter: false,
        facebook: false,
        instagram: false,
        telegram: false,
        youtube: false,
        email: false,
        deleter: false,
      }}
      page={page}
      perPage={perPage}
      perPageChoices={SCANS_LIST_PER_PAGE_CHOICES}
      queryableFields={SCANS_LIST_QUERYABLE_FIELDS.options}
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
