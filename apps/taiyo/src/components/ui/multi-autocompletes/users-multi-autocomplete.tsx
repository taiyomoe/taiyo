import type { AlgoliaSearchResponse } from "@meilisearch/instant-meilisearch"
import type { UsersIndexItem } from "@taiyomoe/types"
import {
  MultiSelectAsync,
  type MultiSelectProps,
} from "~/components/generics/multi-select"
import { UsersAutocompleteItem } from "~/components/ui/autocompletes/users/users-autocomplete-item"
import type { SelectItem } from "~/lib/types"
import { meiliClient } from "~/meiliClient"

type RefinedSelectItem = UsersIndexItem & SelectItem

export const UsersMultiAutocomplete = (
  props: MultiSelectProps<RefinedSelectItem>,
) => {
  const loadOptions = async (inputValue: string) => {
    if (!inputValue) return []

    const searched = await meiliClient.search([
      { indexName: "users", params: { query: inputValue } },
    ])
    const results = searched.results as AlgoliaSearchResponse<UsersIndexItem>[]
    const items = results.flatMap((result) => result.hits)

    return items.map((item) => ({
      ...item,
      label: item.name,
      value: item.id,
    }))
  }

  const formatOptionLabel: MultiSelectProps<RefinedSelectItem>["formatOptionLabel"] =
    (item, { context }) => {
      if (context === "value") return item.label

      return <UsersAutocompleteItem item={item} />
    }

  return (
    <MultiSelectAsync<RefinedSelectItem>
      loadOptions={loadOptions}
      formatOptionLabel={formatOptionLabel}
      {...props}
    />
  )
}
