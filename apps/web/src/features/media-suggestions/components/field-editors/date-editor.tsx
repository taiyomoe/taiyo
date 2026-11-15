import { Input } from "@taiyomoe/ui/components/ui/input"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"

export const dateEditor =
  (key: "startDate" | "endDate", label: () => string) =>
  ({ draft, onChange }: EditorProps) => (
    <Input
      aria-label={label()}
      onChange={(event) => {
        onChange({
          ...draft,
          [key]: event.target.value === "" ? null : `${event.target.value}T00:00:00.000Z`,
        })
      }}
      type="date"
      value={draft[key]?.slice(0, 10) ?? ""}
    />
  )
