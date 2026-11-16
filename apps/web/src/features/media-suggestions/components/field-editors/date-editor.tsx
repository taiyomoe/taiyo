import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import { DatePicker } from "@/components/fields/date-picker"

const pad = (value: number) => String(value).padStart(2, "0")
/** Release dates are stored as UTC midnight; the picker works on local days. */
const toLocalDay = (stored: string) => {
  const [year = 1970, month = 1, day = 1] = stored.slice(0, 10).split("-").map(Number)

  return new Date(year, month - 1, day)
}
const toStored = (day: Date) =>
  `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T00:00:00.000Z`

export const dateEditor =
  (key: "startDate" | "endDate", label: () => string) =>
  ({ draft, onChange }: EditorProps) => {
    const stored = draft[key]

    return (
      <DatePicker
        label={label()}
        onChange={(day) => {
          onChange({ ...draft, [key]: day === null ? null : toStored(day) })
        }}
        value={stored === null ? null : toLocalDay(stored)}
      />
    )
  }
