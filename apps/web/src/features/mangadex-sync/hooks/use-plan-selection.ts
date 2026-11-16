import { useState } from "react"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"

export const planItems = (plan: MangaDexPlan) => [
  ...plan.titles,
  ...plan.synopses,
  ...plan.staff,
  ...plan.tags,
  ...plan.links,
  ...plan.fields,
  ...plan.covers,
  ...plan.chapters,
]

export type PlanSelection = {
  selected: ReadonlySet<string>
  setSelected: (keys: readonly string[], checked: boolean) => void
}

export function usePlanSelection(plan: MangaDexPlan) {
  const [selected, setState] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        planItems(plan)
          .filter((item) => item.selected)
          .map((item) => item.key),
      ),
  )

  return {
    selected,
    setSelected: (keys, checked) => {
      setState((current) => {
        const next = new Set(current)

        for (const key of keys) {
          if (checked) {
            next.add(key)
          } else {
            next.delete(key)
          }
        }

        return next
      })
    },
  } satisfies PlanSelection
}
