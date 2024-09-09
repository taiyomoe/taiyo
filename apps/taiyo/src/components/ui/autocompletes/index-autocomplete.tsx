"use client"

import { Autocomplete, type AutocompleteProps } from "@nextui-org/autocomplete"
import type {
  MeilisearchIndexes,
  MeilisearchIndexesItems,
} from "@taiyomoe/types"
import { useCallback } from "react"
import type { Key } from "react-aria-components"
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch"
import { meiliClient } from "~/meiliClient"

export type IndexAutocompleteProps<
  TIndex extends MeilisearchIndexes,
  TItem extends object = MeilisearchIndexesItems<TIndex>,
> = {
  index: TIndex
  onSelectionChange?: (item: TItem | null) => void
} & Omit<AutocompleteProps<TItem>, "onSelectionChange">

const IndexAutocompleteComponent = <
  TIndex extends MeilisearchIndexes,
  TItem extends object = MeilisearchIndexesItems<TIndex>,
>(
  props: IndexAutocompleteProps<TIndex, TItem>,
) => {
  const { onSelectionChange, children, ...rest } = props
  const { query, refine } = useSearchBox()
  const { items } = useHits<TItem>()

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (!key) return onSelectionChange?.(null)

      const value = items.find((item) =>
        "id" in item ? item.id === key : false,
      )

      if (!value) return

      onSelectionChange?.(value)
    },
    [onSelectionChange, items],
  )

  return (
    <Autocomplete<TItem>
      items={items}
      value={query}
      onInputChange={refine}
      onSelectionChange={handleSelectionChange}
      placeholder="Pesquisar..."
      {...rest}
    >
      {children}
    </Autocomplete>
  )
}

const IndexAutocompleteWrapper = <TIndex extends MeilisearchIndexes>(
  props: IndexAutocompleteProps<TIndex>,
) => (
  <InstantSearch searchClient={meiliClient} indexName={props.index}>
    <IndexAutocompleteComponent {...props} />
  </InstantSearch>
)

export const IndexAutocomplete = IndexAutocompleteWrapper
