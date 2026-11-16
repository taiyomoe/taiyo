// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  isActiveMangaDexSync,
  mangaDexSyncsQueryOptions,
} from "@/features/mangadex-sync/api/mangadex-sync"
import { ActiveSync } from "@/features/mangadex-sync/components/active-sync"
import { SyncHistory } from "@/features/mangadex-sync/components/sync-history"
import { SyncPlan } from "@/features/mangadex-sync/components/sync-plan"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"

export function MangaDexSyncPanel({ mediaId }: { mediaId: string }) {
  const [mangaDexId, setMangaDexId] = useState<string | null>(null)
  const syncs = useQuery(mangaDexSyncsQueryOptions(mediaId))
  const active = syncs.data?.find((sync) => isActiveMangaDexSync(sync.status))
  let current = null

  if (active !== undefined) {
    current = <ActiveSync mediaId={mediaId} syncId={active.id} />
  } else if (!syncs.isPending) {
    current = <SyncPlan mangaDexId={mangaDexId} mediaId={mediaId} onLink={setMangaDexId} />
  }

  return (
    <div sx={syncStyles.column}>
      {current}
      <SyncHistory syncs={syncs.data ?? []} />
    </div>
  )
}
