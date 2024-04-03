import { useFormContext } from "react-hook-form"
import { Label } from "~/components/generics/Label"
import { MultiSelectAsync } from "~/components/generics/multi-select"
import { api } from "~/trpc/react"

export const ScansField = () => {
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

  return (
    <Label label="Scans" isRequired>
      <MultiSelectAsync
        onChange={(values) => {
          setValue(
            "scanIds",
            values.map((v) => v.value),
            { shouldValidate: true, shouldDirty: true },
          )
        }}
        loadOptions={loadOptions}
      />
    </Label>
  )
}
