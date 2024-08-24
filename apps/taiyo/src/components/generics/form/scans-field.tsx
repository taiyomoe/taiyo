import type { AlgoliaSearchResponse } from "@meilisearch/instant-meilisearch"
import type { ScansIndexItem } from "@taiyomoe/types"
import { useFormContext } from "react-hook-form"
import { Label } from "~/components/generics/label"
import {
  MultiSelectAsync,
  type MultiSelectProps,
} from "~/components/generics/multi-select"
import { cn } from "~/lib/utils/cn"
import { meiliClient } from "~/meiliClient"

type Props = { name: string } & MultiSelectProps

export const ScansField = ({ name, className, ...rest }: Props) => {
  const { setValue } = useFormContext()

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

  const handleChange: MultiSelectProps["onChange"] = (values) => {
    setValue(
      name,
      values.map((v) => v.value),
      { shouldValidate: true, shouldDirty: true },
    )
  }

  return (
    <Label label="Scans" className={cn("grow", className)} isRequired>
      <MultiSelectAsync
        onChange={handleChange}
        loadOptions={loadOptions}
        {...rest}
      />
    </Label>
  )
}
