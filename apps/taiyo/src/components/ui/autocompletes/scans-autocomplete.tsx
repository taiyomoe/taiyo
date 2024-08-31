import { AutocompleteItem } from "@nextui-org/react"
import {
  IndexAutocomplete,
  type IndexAutocompleteProps,
} from "~/components/ui/autocompletes/index-autocomplete"

type Props = Omit<IndexAutocompleteProps<"scans">, "index" | "children">

export const ScansAutocomplete = (props: Props) => (
  <IndexAutocomplete index="scans" aria-label="Search for a scan" {...props}>
    {(item) => (
      <AutocompleteItem key={item.id} textValue={item.name}>
        <p>{item.name}</p>
      </AutocompleteItem>
    )}
  </IndexAutocomplete>
)
