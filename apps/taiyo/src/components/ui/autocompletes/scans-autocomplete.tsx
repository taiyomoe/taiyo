"use client"

import {
  Autocomplete,
  AutocompleteItem,
  type AutocompleteItemProps,
  type AutocompleteProps,
} from "@nextui-org/autocomplete"
import type { ScansIndexItem } from "@taiyomoe/types"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import type { Key } from "react-aria-components"
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch"
import { meiliClient } from "~/meiliClient"

type Props = {
  href?: string
  onSelectionChange?: (item: ScansIndexItem) => void
  itemProps?: Omit<AutocompleteItemProps<ScansIndexItem>, "key">
} & Omit<AutocompleteProps<ScansIndexItem>, "children" | "onSelectionChange">

const ScansAutocompleteComponent = (props: Props) => {
  const { href, onSelectionChange, itemProps, ...rest } = props
  const { query, refine } = useSearchBox()
  const { items } = useHits<ScansIndexItem>()
  const router = useRouter()

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (!key) return

      const scan = items.find((item) => item.id === key)!

      if (onSelectionChange) {
        onSelectionChange(scan)
      }

      if (href) {
        router.push(href + scan.id)
      }
    },
    [onSelectionChange, router.push, items, href],
  )

  return (
    <Autocomplete<ScansIndexItem>
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
        <AutocompleteItem key={item.id} {...itemProps} textValue={item.name}>
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
