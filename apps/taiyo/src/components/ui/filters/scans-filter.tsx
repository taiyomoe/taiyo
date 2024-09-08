import type { MultiSelectProps } from "~/components/generics/multi-select"
import { ScansMultiAutocomplete } from "~/components/ui/multi-autocompletes/scans-multi-autocomplete"

type Props = {
  scanIds: string[]
  setScanIds: (ids: string[]) => void
}

export const ScansFilter = ({ scanIds, setScanIds }: Props) => {
  const handleChange: MultiSelectProps["onChange"] = (values) => {
    setScanIds(values.map((v) => v.value))
  }

  return (
    <ScansMultiAutocomplete
      defaultInputValue={scanIds.join(", ")}
      onChange={handleChange}
    />
  )
}
