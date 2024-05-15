import { useFormContext } from "react-hook-form"
import { Label } from "~/components/generics/label"
import {
  MultiSelectAsync,
  type MultiSelectProps,
} from "~/components/generics/multi-select"
import { cn } from "~/lib/utils/cn"
import { api } from "~/trpc/react"

type Props = { name: string } & MultiSelectProps

export const ScansField = ({ name, className, ...rest }: Props) => {
  const { setValue } = useFormContext()
  const { mutateAsync } = api.scans.search.useMutation()

  const loadOptions = async (inputValue: string) => {
    if (!inputValue) return []

    const data = await mutateAsync(inputValue)

    return data.map((item) => ({
      label: item.name,
      value: item.id,
    }))
  }

  const handleChange: MultiSelectProps["onChange"] = (values) => {
    console.log("handleChange", values)

    setValue(
      name,
      values.map((v) => v.value),
      { shouldValidate: true, shouldDirty: true },
    )
  }

  return (
    <Label label="Scans" className={cn("grow", className)} isRequired>
      <MultiSelectAsync
        onChange={handleChange}
        loadOptions={loadOptions}
        {...rest}
      />
    </Label>
  )
}
