import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import type { MangaDexSyncSummary } from "@/features/mangadex-sync/api/mangadex-sync"
import { m } from "@/paraglide/messages"

const STATUSES: Record<
  MangaDexSyncSummary["status"],
  { label: () => string; variant: BadgeVariant }
> = {
  PENDING: { label: m.mangadex_status_pending, variant: "secondary" },
  RUNNING: { label: m.mangadex_status_running, variant: "info" },
  FINISHED: { label: m.mangadex_status_finished, variant: "success" },
  FAILED: { label: m.mangadex_status_failed, variant: "error" },
  CANCELLED: { label: m.mangadex_status_cancelled, variant: "outline" },
}

export function SyncStatusBadge({ status }: { status: MangaDexSyncSummary["status"] }) {
  return <Badge variant={STATUSES[status].variant}>{STATUSES[status].label()}</Badge>
}
