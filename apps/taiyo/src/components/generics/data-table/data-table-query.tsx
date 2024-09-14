import type { ListQuery } from "@taiyomoe/types"
import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { SearchInput } from "~/components/generics/inputs/search-input"
import {
  MultiSelect,
  type MultiSelectProps,
} from "~/components/generics/multi-select"
import { useDataTable } from "./data-table-context"

type Props<TQueryAttribute> = {
  fields: string[]
  onChange: (newQuery: ListQuery<TQueryAttribute>) => void
}

export const DataTableQuery = <TQueryAttribute,>({
  fields,
  onChange,
}: Props<TQueryAttribute>) => {
  const [query, setQuery] = useState<ListQuery<TQueryAttribute>>({
    attributes: [],
    q: "",
  })
  const table = useDataTable()
  const options = table
    .getAllColumns()
    .map((c) => {
      if (
        !("accessorKey" in c.columnDef) ||
        !fields.includes(c.columnDef.accessorKey)
      ) {
        return null
      }

      return {
        label: c.columnDef.header?.toString() || c.id,
        value: c.columnDef.accessorKey as string,
      }
    })
    .filter(Boolean)

  const handleChange: NonNullable<MultiSelectProps["onChange"]> = (
    newOptions,
  ) => {
    const newQuery = {
      ...query,
      attributes: newOptions.map((o) => o.value) as TQueryAttribute[],
    }

    onChange(newQuery)
    setQuery(newQuery)
  }

  const handleValueChange = useDebounceCallback((newValue: string) => {
    const newQuery = { ...query, q: newValue }

    onChange(newQuery)
    setQuery(newQuery)
  }, 300)

  return (
    <div className="flex flex-col items-center gap-4 lg:flex-row">
      <MultiSelect
        classNames={{ container: () => "w-full lg:w-64" }}
        options={options}
        onChange={handleChange}
      />
      <SearchInput
        className="w-full lg:w-[300px]"
        onValueChange={handleValueChange}
      />
    </div>
  )
}
