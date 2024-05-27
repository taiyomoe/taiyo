import { MediasSearchAutocomplete } from "~/components/ui/medias-search/autocomplete/medias-search-autocomplete"

export default function Page() {
  return (
    <MediasSearchAutocomplete
      href="edit/"
      itemProps={{ hideSelectedIcon: true }}
    />
  )
}
