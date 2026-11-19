import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import type { BulkResult } from "@/features/catalog/api/catalog"
import { m } from "@/paraglide/messages"

/** Tells how a review went, and how many chapters were left alone. */
export const toastReviewResult = (
  result: BulkResult,
  title: (args: { count: number }) => string,
) => {
  toastManager.add({
    title: title({ count: result.done.length }),
    type: result.skipped.length > 0 ? "warning" : "success",
    ...(result.skipped.length === 0
      ? {}
      : { description: m.review_bulk_skipped({ count: result.skipped.length }) }),
  })
}
