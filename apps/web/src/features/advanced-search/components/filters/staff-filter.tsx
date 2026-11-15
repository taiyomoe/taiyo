import * as stylex from "@stylexjs/stylex"
import { keepPreviousData, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  type StaffOption,
  staffQueryOptions,
  staffSearchQueryOptions,
} from "@/features/advanced-search/api/staffs"
import { ComboFilter } from "@/features/advanced-search/components/filters/combo-filter"
import { FilterSummary } from "@/features/advanced-search/components/filters/filter-summary"
import { StaffRow } from "@/features/advanced-search/components/filters/staff-row"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { m } from "@/paraglide/messages"

const SEARCH_DEBOUNCE_MS = 250
const styles = stylex.create({
  hint: {
    margin: 0,
  },
})

export function StaffFilter({
  label,
  searchPlaceholder,
  value,
  onValueChange,
}: {
  label: string
  searchPlaceholder: string
  value: readonly string[]
  onValueChange: (value: string[]) => void
}) {
  const queryClient = useQueryClient()
  const [input, setInput] = useState("")
  const term = useDebouncedValue(input.trim(), SEARCH_DEBOUNCE_MS)
  const results = useQuery({
    ...staffSearchQueryOptions(term),
    enabled: term.length > 0,
    placeholderData: keepPreviousData,
  })
  const selected = useQueries({
    queries: value.map((id) => staffQueryOptions(id)),
    combine: (queries) =>
      queries.map((query, index): StaffOption => ({
        id: value[index] ?? "",
        name: query.data?.name ?? (query.isError ? m.search_staff_unknown() : "…"),
        imageUrl: query.data?.imageUrl ?? null,
      })),
  })
  const searching = input.trim().length > 0
  const pending = searching && (term !== input.trim() || results.isFetching)
  const searchStatus = pending ? m.search_staff_searching() : m.search_staff_none()

  return (
    <ComboFilter<StaffOption>
      async
      empty={searching ? searchStatus : <p sx={styles.hint}>{m.search_staff_hint()}</p>}
      getKey={(staff) => staff.id}
      getLabel={(staff) => staff.name}
      inputValue={input}
      items={searching ? (results.data ?? []) : selected}
      label={label}
      onInputValueChange={setInput}
      onValueChange={(next) => {
        for (const staff of next) {
          if (staff.name !== "…") {
            queryClient.setQueryData(staffQueryOptions(staff.id).queryKey, staff)
          }
        }

        onValueChange(next.map((staff) => staff.id))
      }}
      renderItem={(staff) => <StaffRow staff={staff} />}
      searchPlaceholder={searchPlaceholder}
      summary={<FilterSummary labels={selected.map((staff) => staff.name)} />}
      value={selected}
    />
  )
}
