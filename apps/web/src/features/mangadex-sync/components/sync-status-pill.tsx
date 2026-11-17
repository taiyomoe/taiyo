import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import type { MangaDexSyncSummary } from "@/features/mangadex-sync/api/mangadex-sync"
import { Pill } from "@/components/badges/pill"
import { m } from "@/paraglide/messages"

const STATUSES = {
  PENDING: { label: m.mangadex_status_pending, variant: "secondary" },
  RUNNING: { label: m.mangadex_status_running, variant: "info" },
  FINISHED: { label: m.mangadex_status_finished, variant: "success" },
  FAILED: { label: m.mangadex_status_failed, variant: "error" },
  CANCELLED: { label: m.mangadex_status_cancelled, variant: "outline" },
} satisfies Record<MangaDexSyncSummary["status"], { label: () => string; variant: BadgeVariant }>

export function SyncStatusPill({ status }: { status: MangaDexSyncSummary["status"] }) {
  return <Pill variant={STATUSES[status].variant}>{STATUSES[status].label()}</Pill>
}
