import { useState } from "react"

/**
 * Tracks the rows picked on the current page. Rows that leave the page, after a
 * search, a filter or a page change, drop out of the selection.
 */
export function useSelection(visibleIds: readonly string[]) {
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set())
  const ids = visibleIds.filter((id) => picked.has(id))
  const all = visibleIds.length > 0 && ids.length === visibleIds.length

  return {
    ids,
    has: (id: string) => picked.has(id),
    toggle: (id: string) => {
      setPicked((current) => {
        const next = new Set(current)

        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }

        return next
      })
    },
    header: {
      checked: all,
      indeterminate: ids.length > 0 && !all,
      onToggle: () => {
        setPicked(all ? new Set() : new Set(visibleIds))
      },
    },
    clear: () => {
      setPicked(new Set())
    },
  }
}

export type Selection = ReturnType<typeof useSelection>
