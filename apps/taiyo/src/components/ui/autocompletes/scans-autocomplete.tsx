"use client"

import {
  Autocomplete,
  AutocompleteItem,
  type AutocompleteProps,
} from "@nextui-org/autocomplete"
import type { ScansIndexItem } from "@taiyomoe/types"
import { useCallback } from "react"
import type { Key } from "react-aria-components"
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch"
import { meiliClient } from "~/meiliClient"

type Props = {
  onSelectionChange?: (item: ScansIndexItem | null) => void
} & Omit<AutocompleteProps<ScansIndexItem>, "children" | "onSelectionChange">

const ScansAutocompleteComponent = ({ onSelectionChange, ...props }: Props) => {
  const { query, refine } = useSearchBox()
  const { items } = useHits<ScansIndexItem>()

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (!key) return onSelectionChange?.(null)

      const user = items.find((item) => item.id === key)!

      onSelectionChange?.(user)
    },
    [onSelectionChange, items],
  )

  return (
    <Autocomplete<ScansIndexItem>
      items={items}
      value={query}
      onInputChange={refine}
      onSelectionChange={handleSelectionChange}
      placeholder="Pesquisar..."
      aria-label="Search for a scan"
      {...props}
    >
      {(item) => (
        <AutocompleteItem key={item.id} textValue={item.name}>
          <p>{item.name}</p>
        </AutocompleteItem>
      )}
    </Autocomplete>
  )
}

const ScansAutocompleteWrapper = (props: Props) => (
  <InstantSearch searchClient={meiliClient} indexName="scans">
    <ScansAutocompleteComponent {...props} />
  </InstantSearch>
)

export const ScansAutocomplete = ScansAutocompleteWrapper
export type ScansAutocompleteProps = Props
