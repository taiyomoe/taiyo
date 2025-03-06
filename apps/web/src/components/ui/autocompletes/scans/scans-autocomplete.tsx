import { AutocompleteItem } from "@heroui/autocomplete"
import {
  IndexAutocomplete,
  type IndexAutocompleteProps,
} from "~/components/ui/autocompletes/index-autocomplete"

export type ScansAutocompleteProps = Omit<
  IndexAutocompleteProps<"scans">,
  "index" | "children"
>

export const ScansAutocomplete = (props: ScansAutocompleteProps) => (
  <IndexAutocomplete index="scans" aria-label="Search for a scan" {...props}>
    {(item) => (
      <AutocompleteItem key={item.id} textValue={item.name}>
        <p>{item.name}</p>
      </AutocompleteItem>
    )}
  </IndexAutocomplete>
)
