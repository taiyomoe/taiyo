import { ScansAutocomplete } from "~/components/ui/autocompletes/scans-autocomplete"

export default function Page() {
  return (
    <ScansAutocomplete href="edit/" itemProps={{ hideSelectedIcon: true }} />
  )
}
