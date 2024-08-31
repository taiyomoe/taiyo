"use client"

import {
  Autocomplete,
  AutocompleteItem,
  type AutocompleteProps,
} from "@nextui-org/autocomplete"
import { useSession } from "@taiyomoe/auth/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { useCallback } from "react"
import type { Key } from "react-aria-components"
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch"
import { meiliClient } from "~/meiliClient"
import { MediasAutocompleteItem } from "./medias-autocomplete-item"

type Props = {
  onSelectionChange?: (item: MediasIndexItem | null) => void
} & Omit<AutocompleteProps<MediasIndexItem>, "children" | "onSelectionChange">

const MediasAutocompleteComponent = ({
  onSelectionChange,
  ...props
}: Props) => {
  const session = useSession()
  const { query, refine } = useSearchBox()
  const { items } = useHits<MediasIndexItem>()

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (!key) return onSelectionChange?.(null)

      const value = items.find((item) => item.id === key)!

      onSelectionChange?.(value)
    },
    [onSelectionChange, items],
  )

  return (
    <Autocomplete<MediasIndexItem>
      items={items}
      value={query}
      onInputChange={refine}
      onSelectionChange={handleSelectionChange}
      placeholder="Pesquisar..."
      aria-label="Search for a media"
      {...props}
    >
      {(item) => {
        const title = MediaUtils.getDisplayTitle(
          item.titles,
          session?.data?.user.preferredTitles,
        )

        return (
          <AutocompleteItem key={item.id} textValue={title}>
            <MediasAutocompleteItem item={item} title={title} />
          </AutocompleteItem>
        )
      }}
    </Autocomplete>
  )
}

const MediasAutocompleteWrapper = (props: Props) => (
  <InstantSearch searchClient={meiliClient} indexName="medias">
    <MediasAutocompleteComponent {...props} />
  </InstantSearch>
)

export const MediasAutocomplete = MediasAutocompleteWrapper
export type MediasAutocompleteProps = Props
