// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { MangaDexSyncSummary } from "@/features/mangadex-sync/api/mangadex-sync"
import { DashboardSection, ListCard, ListRow } from "@/components/layout/dashboard-page"
import { SyncStatusBadge } from "@/features/mangadex-sync/components/sync-status-badge"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
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

export function SyncHistory({ syncs }: { syncs: MangaDexSyncSummary[] }) {
  if (syncs.length === 0) {
    return null
  }

  return (
    <DashboardSection title={m.mangadex_history()}>
      <ListCard>
        {syncs.map((sync) => {
          const added = SUMMARY_LABELS.flatMap(([key, label]) => {
            const count = sync.summary[key] ?? 0

            return count === 0 ? [] : [label({ count })]
          })
          const { done, skipped, failed } = sync.counts

          return (
            <ListRow key={sync.id}>
              <span sx={syncStyles.rowBody}>
                <span sx={syncStyles.rowTitle}>
                  {new Date(sync.createdAt).toLocaleString(getLocale(), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  <SyncStatusBadge status={sync.status} />
                </span>
                <span sx={syncStyles.muted}>
                  {[
                    m.mangadex_history_by({ name: sync.user.name }),
                    ...added,
                    done + skipped + failed === 0
                      ? null
                      : m.mangadex_history_items({ done, skipped, failed }),
                  ]
                    .filter((part) => part !== null)
                    .join(" · ")}
                </span>
                {sync.error === null ? null : <span sx={syncStyles.muted}>{sync.error}</span>}
              </span>
            </ListRow>
          )
        })}
      </ListCard>
    </DashboardSection>
  )
}
