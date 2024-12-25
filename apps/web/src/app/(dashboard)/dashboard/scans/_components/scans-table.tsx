"use client"

import { SCANS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { AppRouter } from "@taiyomoe/trpc"
import { useQueryStates } from "nuqs"
import { assign, crush, mapValues } from "radash"
import { useEffect } from "react"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useScansListStore } from "~/stores/use-scans-list-store"
import { api } from "~/trpc/react"
import { keepPreviousData } from "~/utils/keep-previous-data"
import { scansSearchParams } from "./scans-search-params"
import { columns } from "./scans-table-columns"
import { ScansTableEmptyContent } from "./scans-table-empty-content"
import { ScansTableFilters } from "./scans-table-filters"

type Props = {
  initialData: Awaited<ReturnType<AppRouter["scans"]["getList"]>>
}

export const ScansTable = ({ initialData }: Props) => {
  const [_, setSearchParams] = useQueryStates(scansSearchParams)
  const { input, setSort, setPage, setPerPage } = useScansListStore()
  const {
    data: { scans: items, totalPages, totalCount } = initialData,
    isFetching,
  } = api.scans.getList.useQuery(input, {
    placeholderData: keepPreviousData(initialData),
  })

  useEffect(() => {
    const emptySearchParams = mapValues(scansSearchParams, () => null)
    const searchParams = assign(emptySearchParams, crush(input))

    setSearchParams(searchParams)
  }, [input, setSearchParams])

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<ScansTableFilters />}
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
      page={input.page}
      perPage={input.perPage}
      perPageChoices={SCANS_LIST_PER_PAGE_CHOICES}
      totalPages={totalPages}
      totalCount={totalCount}
      isLoading={isFetching}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      onSort={setSort}
    />
  )
}
