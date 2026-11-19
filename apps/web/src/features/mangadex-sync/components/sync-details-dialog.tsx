import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import type { MangaDexSyncSummary } from "@/features/mangadex-sync/api/mangadex-sync"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { TimeAgo } from "@/components/time/time-ago"
import {
  DetailDialog,
  DetailQuote,
  DetailSection,
} from "@/features/groups/components/detail-dialog"
import { mangaDexSyncQueryOptions } from "@/features/mangadex-sync/api/mangadex-sync"
import { SyncItemRow } from "@/features/mangadex-sync/components/sync-item-row"
import { SyncStatusPill } from "@/features/mangadex-sync/components/sync-status-pill"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { describeAdded, describeItems, syncName } from "@/features/mangadex-sync/lib/sync-summary"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  pills: {
    display: "flex",
  },
  text: {
    margin: 0,
    fontSize: "0.875rem",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },
  nothing: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  items: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
  },
  skeleton: {
    borderRadius: radius.xl,
    height: "9rem",
  },
})

/** A sync in full: its status and error, what it added, and each cover and chapter it queued. */
export function SyncDetailsDialog({
  sync,
  onClose,
}: {
  sync: MangaDexSyncSummary | null
  onClose: () => void
}) {
  const added = sync === null ? null : describeAdded(sync)
  const progress = sync === null ? null : describeItems(sync)
  const detail = useQuery({
    ...mangaDexSyncQueryOptions(sync?.id ?? ""),
    enabled: progress !== null,
  })
  let items = <Skeleton sx={styles.skeleton} />

  if (progress === null || detail.data?.items.length === 0) {
    items = <p sx={[styles.text, styles.nothing]}>{m.mangadex_details_no_items()}</p>
  } else if (detail.isError) {
    items = <ErrorAlert message={getErrorMessage(detail.error)} />
  } else if (detail.data !== undefined) {
    items = (
      <ul sx={[syncStyles.plainList, styles.items]}>
        {detail.data.items.map((item) => (
          <SyncItemRow item={item} key={item.id} />
        ))}
      </ul>
    )
  }

  return (
    <DetailDialog
      meta={
        sync === null ? null : (
          <>
            {m.mangadex_history_by({ name: sync.user.displayUsername })}
            <span aria-hidden>·</span>
            <TimeAgo date={sync.createdAt} length="long" />
          </>
        )
      }
      onClose={onClose}
      open={sync !== null}
      title={sync === null ? null : syncName(sync)}
    >
      {sync === null || added === null ? null : (
        <>
          <DetailSection title={m.mangadex_column_status()}>
            <div sx={styles.pills}>
              <SyncStatusPill status={sync.status} />
            </div>
            {sync.error === null ? null : <DetailQuote>{sync.error}</DetailQuote>}
          </DetailSection>
          <DetailSection title={m.mangadex_column_added()}>
            <p sx={[styles.text, added.empty && styles.nothing]}>{added.text}</p>
          </DetailSection>
          <DetailSection title={m.mangadex_column_items()}>
            {progress === null ? null : <p sx={styles.text}>{progress}</p>}
            {items}
          </DetailSection>
        </>
      )}
    </DetailDialog>
  )
}
