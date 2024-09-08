import { AutocompleteItem } from "@nextui-org/autocomplete"
import {
  IndexAutocomplete,
  type IndexAutocompleteProps,
} from "~/components/ui/autocompletes/index-autocomplete"
import { UsersAutocompleteItem } from "./users-autocomplete-item"

type Props = Omit<IndexAutocompleteProps<"users">, "index" | "children">

export const UsersAutocomplete = (props: Props) => (
  <IndexAutocomplete index="users" aria-label="Search for a user" {...props}>
    {(item) => (
      <AutocompleteItem key={item.id} textValue={item.name ?? ""}>
        <UsersAutocompleteItem item={item} />
      </AutocompleteItem>
    )}
  </IndexAutocomplete>
)
