import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"

export function SelectAllCheckbox({
  keys,
  selection,
  label,
}: {
  keys: readonly string[]
  selection: PlanSelection
  label: string
}) {
  const picked = keys.filter((key) => selection.selected.has(key)).length

  return (
    <Checkbox
      aria-label={label}
      checked={keys.length > 0 && picked === keys.length}
      indeterminate={picked > 0 && picked < keys.length}
      onCheckedChange={(checked) => {
        selection.setSelected(keys, checked)
      }}
    />
  )
}
