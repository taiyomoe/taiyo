import type { MangaDexSyncSummary } from "@/features/mangadex-sync/api/mangadex-sync"
import { isActiveMangaDexSync } from "@/features/mangadex-sync/api/mangadex-sync"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const SUMMARY_LABELS = [
  ["titles", m.mangadex_summary_titles],
  ["synopses", m.mangadex_summary_synopses],
  ["staff", m.mangadex_summary_staff],
  ["tags", m.mangadex_summary_tags],
  ["links", m.mangadex_summary_links],
  ["fields", m.mangadex_summary_fields],
] as const

/** A sync by the moment it started, since a media's syncs only differ by it. */
export const syncName = (sync: MangaDexSyncSummary) =>
  m.mangadex_sync_name({
    date: new Date(sync.createdAt).toLocaleString(getLocale(), {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  })

/** What the sync added to the media right away; `empty` when it only queued covers and chapters. */
export const describeAdded = (sync: MangaDexSyncSummary) => {
  const parts = SUMMARY_LABELS.flatMap(([key, label]) => {
    const count = sync.summary[key] ?? 0

    return count === 0 ? [] : [label({ count })]
  })
  const { pending, done, skipped, failed } = sync.counts

  if (parts.length > 0) {
    return { text: parts.join(" · "), empty: false }
  }

  return {
    text:
      pending + done + skipped + failed === 0
        ? m.mangadex_history_nothing()
        : m.mangadex_history_items_only(),
    empty: true,
  }
}

/** How far the covers and chapters got, or `null` when the sync queued none. */
export const describeItems = (sync: MangaDexSyncSummary) => {
  const { pending, done, skipped, failed } = sync.counts
  const settled = done + skipped + failed

  if (settled + pending === 0) {
    return null
  }

  return isActiveMangaDexSync(sync.status)
    ? m.mangadex_active_progress({ done: settled, total: settled + pending })
    : m.mangadex_history_items({ done, skipped, failed })
}
