// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { LANGUAGES } from "@taiyomoe/db/constants"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import type { MangaDexSyncItem } from "@/features/mangadex-sync/api/mangadex-sync"
import { getLanguageName } from "@/components/flags/language-flags"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { m } from "@/paraglide/messages"

const STATUSES: Record<
  MangaDexSyncItem["status"],
  { label: () => string; variant: "secondary" | "success" | "error" }
> = {
  PENDING: { label: m.mangadex_item_pending, variant: "secondary" },
  DONE: { label: m.mangadex_item_done, variant: "success" },
  SKIPPED: { label: m.mangadex_item_skipped, variant: "secondary" },
  FAILED: { label: m.mangadex_item_failed, variant: "error" },
}

export function SyncItemRow({ item }: { item: MangaDexSyncItem }) {
  const { details } = item
  const known = LANGUAGES.find((language) => language === details.language)
  const language = known === undefined ? details.language : getLanguageName(known)
  const volume = details.volume === null ? null : m.chapter_volume({ volume: details.volume })
  const title =
    item.kind === "COVER"
      ? m.mangadex_item_cover({ volume: volume ?? m.mangadex_cover_no_volume() })
      : m.chapter_number({ number: details.number ?? 0 })

  return (
    <li sx={[syncStyles.item, syncStyles.row]}>
      <span sx={syncStyles.rowBody}>
        <span sx={syncStyles.rowTitle}>
          {title}
          <span sx={syncStyles.muted}>
            {[language, item.kind === "CHAPTER" ? volume : null, ...(details.groups ?? [])]
              .filter((part) => part !== null)
              .join(" · ")}
          </span>
        </span>
        {item.error === null ? null : <span sx={syncStyles.muted}>{item.error}</span>}
      </span>
      <Badge variant={STATUSES[item.status].variant}>{STATUSES[item.status].label()}</Badge>
    </li>
  )
}
