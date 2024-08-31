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
import { MediasSearchAutocompleteItem } from "~/components/ui/medias-search/autocomplete/medias-search-autocomplete-item"
import { meiliClient } from "~/meiliClient"

type Props = {
  onSelectionChange?: (item: MediasIndexItem) => void
} & Omit<AutocompleteProps<MediasIndexItem>, "children" | "onSelectionChange">

const MediasAutocompleteComponent = (props: Props) => {
  const { onSelectionChange, ...rest } = props
  const session = useSession()
  const { query, refine } = useSearchBox()
  const { items } = useHits<MediasIndexItem>()

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (!key) return

      const media = items.find((item) => item.id === key)!

      if (onSelectionChange) {
        onSelectionChange(media)
      }
    },
    [onSelectionChange, items],
  )

  return (
    <Autocomplete<MediasIndexItem>
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
      {(item) => {
        const title = MediaUtils.getDisplayTitle(
          item.titles,
          session?.data?.user.preferredTitles,
        )

        return (
          <AutocompleteItem key={item.id} textValue={title}>
            <MediasSearchAutocompleteItem item={item} title={title} />
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
