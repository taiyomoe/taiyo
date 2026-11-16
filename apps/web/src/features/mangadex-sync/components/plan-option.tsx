import type { ReactNode } from "react"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"

export function PlanOption({
  itemKey,
  selection,
  title,
  description,
  trailing,
}: {
  itemKey: string
  selection: PlanSelection
  title: ReactNode
  description?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <li sx={syncStyles.item}>
      <label sx={syncStyles.row}>
        <Checkbox
          checked={selection.selected.has(itemKey)}
          onCheckedChange={(checked) => {
            selection.setSelected([itemKey], checked)
          }}
        />
        <span sx={syncStyles.rowBody}>
          <span sx={syncStyles.rowTitle}>{title}</span>
          {description === undefined ? null : <span sx={syncStyles.muted}>{description}</span>}
        </span>
        {trailing === undefined ? null : <span sx={syncStyles.trailing}>{trailing}</span>}
      </label>
    </li>
  )
}
