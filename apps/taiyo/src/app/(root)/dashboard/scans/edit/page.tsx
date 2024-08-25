import { ScansSearchAutocomplete } from "~/components/ui/scans-search/scans-search-autocomplete"

export default function Page() {
  return (
    <ScansSearchAutocomplete
      href="edit/"
      itemProps={{ hideSelectedIcon: true }}
    />
  )
}
