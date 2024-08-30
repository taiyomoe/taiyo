import type { AlgoliaSearchResponse } from "@meilisearch/instant-meilisearch"
import type { ScansIndexItem } from "@taiyomoe/types"
import {
  MultiSelectAsync,
  type MultiSelectProps,
} from "~/components/generics/multi-select"
import { meiliClient } from "~/meiliClient"

export const ScansMultiAutocomplete = (props: MultiSelectProps) => {
  const loadOptions = async (inputValue: string) => {
    if (!inputValue) return []

    const searched = await meiliClient.search([
      { indexName: "scans", params: { query: inputValue } },
    ])
    const results = searched.results as AlgoliaSearchResponse<ScansIndexItem>[]
    const items = results.flatMap((result) => result.hits)

    return items.map((item) => ({
      label: item.name,
      value: item.id,
    }))
  }

  return <MultiSelectAsync loadOptions={loadOptions} {...props} />
}
