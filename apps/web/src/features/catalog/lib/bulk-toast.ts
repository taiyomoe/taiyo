import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import type { BulkResult } from "@/features/catalog/api/catalog"
import { m } from "@/paraglide/messages"

/** Tells how a bulk action went, and why some rows were left alone. */
export const toastBulkResult = (result: BulkResult, title: (args: { count: number }) => string) => {
  const main = result.skipped.filter((item) => item.reason === "MAIN_COVER").length
  const other = result.skipped.length - main
  const description = [
    ...(other > 0 ? [m.catalog_bulk_skipped({ count: other })] : []),
    ...(main > 0 ? [m.catalog_bulk_skipped_main({ count: main })] : []),
  ].join(" ")

  toastManager.add({
    title: title({ count: result.done.length }),
    type: result.skipped.length > 0 ? "warning" : "success",
    ...(description === "" ? {} : { description }),
  })
}
