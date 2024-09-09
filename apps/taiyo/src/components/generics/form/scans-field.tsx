import { useFormContext } from "react-hook-form"
import { Label } from "~/components/generics/label"
import type { MultiSelectProps } from "~/components/generics/multi-select"
import { ScansMultiAutocomplete } from "~/components/ui/multi-autocompletes/scans-multi-autocomplete"
import { cn } from "~/lib/utils/cn"

type Props = { name: string } & MultiSelectProps

export const ScansField = ({ name, className, ...rest }: Props) => {
  const { setValue } = useFormContext()

  const handleChange: MultiSelectProps["onChange"] = (values) => {
    setValue(
      name,
      values.map((v) => v.value),
      { shouldValidate: true, shouldDirty: true },
    )
  }

  return (
    <Label label="Scans" className={cn("grow", className)} isRequired>
      <ScansMultiAutocomplete onChange={handleChange} {...rest} />
    </Label>
  )
}
