import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@taiyomoe/ui/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import {
  isActiveMangaDexSync,
  mangaDexSyncQueryOptions,
  useCancelMangaDexSync,
  useRefreshMangaDexMedia,
} from "@/features/mangadex-sync/api/mangadex-sync"
import { SyncItemRow } from "@/features/mangadex-sync/components/sync-item-row"
import { SyncStatusPill } from "@/features/mangadex-sync/components/sync-status-pill"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  body: {
    gap: "0.75rem",
    paddingInline: "1.25rem",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "1.25rem",
  },
  progressHeader: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
})

export function ActiveSync({ mediaId, syncId }: { mediaId: string; syncId: string }) {
  const sync = useQuery(mangaDexSyncQueryOptions(syncId))
  const cancel = useCancelMangaDexSync()
  const refresh = useRefreshMangaDexMedia(mediaId)
  const status = sync.data?.status
  const active = status === undefined || isActiveMangaDexSync(status)

  // Once the worker is done, compare again: what it imported is no longer missing.
  useEffect(() => {
    if (!active) {
      void refresh()
    }
  }, [active, refresh])

  const items = sync.data?.items ?? []
  const settled = items.filter((item) => item.status !== "PENDING").length
  const current = items.find((item) => item.status === "PENDING")

  return (
    <section sx={syncStyles.card}>
      <div sx={syncStyles.cardHeader}>
        <h2 sx={syncStyles.cardTitle}>
          {m.mangadex_active_title()}
          {status === undefined ? null : <SyncStatusPill status={status} />}
        </h2>
        <Button
          disabled={cancel.isPending || !active}
          onClick={() => {
            cancel.mutate(syncId)
          }}
          size="sm"
          variant="outline"
        >
          {m.mangadex_cancel()}
        </Button>
      </div>
      <div sx={styles.body}>
        <Progress max={Math.max(items.length, 1)} value={settled}>
          <div sx={styles.progressHeader}>
            <ProgressLabel>
              {current === undefined
                ? m.mangadex_active_waiting()
                : m.mangadex_active_progress({ done: settled, total: items.length })}
            </ProgressLabel>
            <ProgressValue />
          </div>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <p sx={syncStyles.muted}>{m.mangadex_active_hint()}</p>
        <ErrorAlert message={cancel.isError ? getErrorMessage(cancel.error) : null} />
      </div>
      <ul sx={[syncStyles.list, syncStyles.scroll]}>
        {items.map((item) => (
          <SyncItemRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}
