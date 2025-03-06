import { AutocompleteItem } from "@heroui/autocomplete"
import { authClient } from "@taiyomoe/auth/client"
import { MediaUtils } from "@taiyomoe/utils"
import {
  IndexAutocomplete,
  type IndexAutocompleteProps,
} from "~/components/ui/autocompletes/index-autocomplete"
import { MediasAutocompleteItem } from "./medias-autocomplete-item"

export type MediasAutocompleteProps = Omit<
  IndexAutocompleteProps<"medias">,
  "index" | "children"
>

export const MediasAutocomplete = (props: MediasAutocompleteProps) => {
  const { data: session } = authClient.useSession()

  return (
    <IndexAutocomplete
      index="medias"
      aria-label="Search for a media"
      {...props}
    >
      {(item) => {
        const title = MediaUtils.getDisplayTitle(
          item.titles,
          session?.user.settings.preferredTitles,
        )

        return (
          <AutocompleteItem key={item.id} textValue={title}>
            <MediasAutocompleteItem item={item} title={title} />
          </AutocompleteItem>
        )
      }}
    </IndexAutocomplete>
  )
}
