"use client"

import { SCANS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import type { AppRouter } from "@taiyomoe/trpc"
import { useQueryStates } from "nuqs"
import {} from "radash"
import { useEffect } from "react"
import { DataTable } from "~/components/generics/data-table/data-table"
import { useScansListStore } from "~/stores/use-scans-list-store"
import { api } from "~/trpc/react"
import { keepPreviousData } from "~/utils/keep-previous-data"
import { normalizeSearchParams } from "~/utils/normalize-search-params"
import { scansSearchParams } from "./scans-search-params"
import { columns } from "./scans-table-columns"
import { ScansTableEmptyContent } from "./scans-table-empty-content"
import { ScansTableFilters } from "./scans-table-filters"
import { ScansTableMultipleActions } from "./scans-table-multiple-actions"

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to this trigger when the input changes
  useEffect(() => {
    const normalized = normalizeSearchParams(scansSearchParams, input)

    setSearchParams(normalized)
  }, [input])

  return (
    <DataTable
      columns={columns}
      data={items}
      filters={<ScansTableFilters />}
      multipleActions={<ScansTableMultipleActions />}
      emptyContent={<ScansTableEmptyContent />}
      initialSort={input.sort}
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
