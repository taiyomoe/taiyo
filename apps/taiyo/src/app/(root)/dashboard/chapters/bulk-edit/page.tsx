import { MediasSearchAutocomplete } from "~/components/ui/medias-search/autocomplete/medias-search-autocomplete"

export default function Page() {
  return (
    <MediasSearchAutocomplete
      href="/dashboard/chapters/bulk-edit/"
      itemProps={{ hideSelectedIcon: true }}
    />
  )
}
