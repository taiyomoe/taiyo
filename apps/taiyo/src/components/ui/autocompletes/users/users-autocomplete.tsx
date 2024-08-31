"use client"

import {
  Autocomplete,
  AutocompleteItem,
  type AutocompleteProps,
} from "@nextui-org/autocomplete"
import type { UsersIndexItem } from "@taiyomoe/types"
import { useCallback } from "react"
import type { Key } from "react-aria-components"
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch"
import { UsersAutocompleteItem } from "~/components/ui/autocompletes/users/users-autocomplete-item"
import { meiliClient } from "~/meiliClient"

type Props = {
  onSelectionChange?: (item: UsersIndexItem | null) => void
} & Omit<AutocompleteProps<UsersIndexItem>, "children" | "onSelectionChange">

const UsersAutocompleteComponent = (props: Props) => {
  const { onSelectionChange, ...rest } = props
  const { query, refine } = useSearchBox()
  const { items } = useHits<UsersIndexItem>()

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (!key) return onSelectionChange?.(null)

      const user = items.find((item) => item.id === key)!

      onSelectionChange?.(user)
    },
    [onSelectionChange, items],
  )

  return (
    <Autocomplete<UsersIndexItem>
      inputProps={{
        classNames: { mainWrapper: "w-full", label: "z-0 min-w-[100px] mr-6" },
      }}
      items={items}
      value={query}
      onInputChange={refine}
      labelPlacement="outside-left"
      placeholder="Pesquisar..."
      aria-label="Search for a scan"
      onSelectionChange={handleSelectionChange}
      {...rest}
    >
      {(item) => (
        <AutocompleteItem key={item.id} textValue={item.name ?? ""}>
          <UsersAutocompleteItem item={item} />
        </AutocompleteItem>
      )}
    </Autocomplete>
  )
}

const UsersAutocompleteWrapper = (props: Props) => (
  <InstantSearch searchClient={meiliClient} indexName="users">
    <UsersAutocompleteComponent {...props} />
  </InstantSearch>
)

export const UsersAutocomplete = UsersAutocompleteWrapper
export type UsersAutocompleteProps = Props
