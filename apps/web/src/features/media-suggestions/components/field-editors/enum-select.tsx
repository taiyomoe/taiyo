import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"

export function EnumSelect<T extends string>({
  value,
  onChange,
  options,
  labels,
  label,
}: {
  value: T
  onChange: (value: T) => void
  options: readonly T[]
  labels: Record<T, () => string>
  label: string
}) {
  return (
    <Select
      onValueChange={(next) => {
        if (next !== null) {
          onChange(next)
        }
      }}
      value={value}
    >
      <SelectTrigger aria-label={label}>
        <SelectValue>{() => labels[value]()}</SelectValue>
      </SelectTrigger>
      <SelectPopup>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labels[option]()}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}
