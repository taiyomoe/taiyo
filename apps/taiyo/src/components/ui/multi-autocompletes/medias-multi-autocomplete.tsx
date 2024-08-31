import type { AlgoliaSearchResponse } from "@meilisearch/instant-meilisearch"
import { useSession } from "@taiyomoe/auth/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import {
  MultiSelectAsync,
  type MultiSelectProps,
} from "~/components/generics/multi-select"
import { MediasSearchAutocompleteItem } from "~/components/ui/medias-search/autocomplete/medias-search-autocomplete-item"
import type { SelectItem } from "~/lib/types"
import { meiliClient } from "~/meiliClient"

type RefinedSelectItem = MediasIndexItem & SelectItem

export const MediasMultiAutocomplete = (
  props: MultiSelectProps<RefinedSelectItem>,
) => {
  const session = useSession()

  const loadOptions = async (inputValue: string) => {
    if (!inputValue) return []

    const searched = await meiliClient.search([
      { indexName: "medias", params: { query: inputValue } },
    ])
    const results = searched.results as AlgoliaSearchResponse<MediasIndexItem>[]
    const items = results.flatMap((result) => result.hits)

    return items.map((item) => ({
      ...item,
      label: MediaUtils.getDisplayTitle(
        item.titles,
        session?.data?.user.preferredTitles,
      ),
      value: item.id,
    }))
  }

  const formatOptionLabel: MultiSelectProps<RefinedSelectItem>["formatOptionLabel"] =
    (item, { context }) => {
      if (context === "value") return item.label

      return <MediasSearchAutocompleteItem item={item} title={item.label} />
    }

  return (
    <MultiSelectAsync<RefinedSelectItem>
      loadOptions={loadOptions}
      formatOptionLabel={formatOptionLabel}
      {...props}
    />
  )
}
