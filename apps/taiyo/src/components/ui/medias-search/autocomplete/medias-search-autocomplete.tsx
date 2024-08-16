"use client"

import {
  Autocomplete,
  AutocompleteItem,
  type AutocompleteItemProps,
  type AutocompleteProps,
} from "@nextui-org/autocomplete"
import { useSession } from "@taiyomoe/auth/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import type { Key } from "react-aria-components"
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch"
import { meiliClient } from "~/meiliClient"
import { MediasSearchAutocompleteItem } from "./medias-search-autocomplete-item"

type Props = {
  href?: string
  onSelectionChange?: (item: MediasIndexItem) => void
  itemProps?: Omit<AutocompleteItemProps<MediasIndexItem>, "key">
} & Omit<AutocompleteProps<MediasIndexItem>, "children" | "onSelectionChange">

const MediasSearchAutocompleteComponent = (props: Props) => {
  const { href, onSelectionChange, itemProps, ...rest } = props
  const { data: session } = useSession()
  const { query, refine } = useSearchBox()
  const { hits } = useHits<MediasIndexItem>()
  const router = useRouter()

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (!key) return

      const media = hits.find((item) => item.id === key)!

      if (onSelectionChange) {
        onSelectionChange(media)
      }

      if (href) {
        router.push(href + media.id)
      }
    },
    [onSelectionChange, router.push, hits, href],
  )

  return (
    <Autocomplete<MediasIndexItem>
      inputProps={{
        classNames: { mainWrapper: "w-full", label: "z-0 min-w-[100px] mr-6" },
      }}
      items={hits}
      value={query}
      onInputChange={refine}
      labelPlacement="outside-left"
      placeholder="Pesquisar..."
      aria-label="Search for a media"
      onSelectionChange={handleSelectionChange}
      {...rest}
    >
      {(item) => {
        const title = MediaUtils.getDisplayTitle(
          item.titles,
          session?.user.preferredTitles,
        )

        return (
          <AutocompleteItem key={item.id} {...itemProps} textValue={title}>
            <MediasSearchAutocompleteItem
              key={item.id}
              item={item}
              title={title}
            />
          </AutocompleteItem>
        )
      }}
    </Autocomplete>
  )
}

const MediasSearchAutocompleteWrapper = (props: Props) => (
  <InstantSearch searchClient={meiliClient} indexName="medias">
    <MediasSearchAutocompleteComponent {...props} />
  </InstantSearch>
)

export const MediasSearchAutocomplete = MediasSearchAutocompleteWrapper
export type MediasSearchAutocompleteProps = Props
