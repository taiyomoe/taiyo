import type { ReactNode } from "react"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { SelectAllCheckbox } from "@/features/mangadex-sync/components/select-all-checkbox"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { m } from "@/paraglide/messages"

export function PlanSection({
  title,
  keys,
  selection,
  aside,
  children,
}: {
  title: string
  keys: readonly string[]
  selection: PlanSelection
  aside?: ReactNode
  children: ReactNode
}) {
  const picked = keys.filter((key) => selection.selected.has(key)).length

  return (
    <section sx={syncStyles.card}>
      <div sx={syncStyles.cardHeader}>
        <label sx={syncStyles.cardTitle}>
          <SelectAllCheckbox
            keys={keys}
            label={m.mangadex_select_section({ section: title })}
            selection={selection}
          />
          <span>{title}</span>
          <span sx={syncStyles.count}>{m.mangadex_picked({ picked, total: keys.length })}</span>
        </label>
        {aside}
      </div>
      {children}
    </section>
  )
}
