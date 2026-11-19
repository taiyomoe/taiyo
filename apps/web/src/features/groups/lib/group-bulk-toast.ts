import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { groupBy } from "remeda"
import type { BulkResult } from "@/features/catalog/api/catalog"
import { m } from "@/paraglide/messages"

type CountMessage = (args: { count: number }) => string

/**
 * Tells how an action on one row or on the selection went, naming why the rows left alone
 * were skipped. When nothing went through, the first reason becomes the title.
 */
export const toastGroupsResult = (
  result: BulkResult,
  title: CountMessage,
  reasons: Readonly<Partial<Record<string, CountMessage>>>,
) => {
  const lines = Object.entries(groupBy(result.skipped, (item) => item.reason)).map(
    ([reason, items]) => (reasons[reason] ?? m.catalog_bulk_skipped)({ count: items.length }),
  )
  const [first = title({ count: 0 }), ...rest] = lines

  if (result.done.length === 0 && lines.length > 0) {
    toastManager.add({
      title: first,
      type: "error",
      ...(rest.length === 0 ? {} : { description: rest.join(" ") }),
    })

    return
  }

  toastManager.add({
    title: title({ count: result.done.length }),
    type: lines.length > 0 ? "warning" : "success",
    ...(lines.length === 0 ? {} : { description: lines.join(" ") }),
  })
}
