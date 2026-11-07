import type { ReaderRank } from "@taiyomoe/db/levels"
import { m } from "@/paraglide/messages"

export const READER_RANK_LABELS: Record<ReaderRank, () => string> = {
  newcomer: m.profile_rank_newcomer,
  pageTurner: m.profile_rank_page_turner,
  apprentice: m.profile_rank_apprentice,
  adept: m.profile_rank_adept,
  scholar: m.profile_rank_scholar,
  sage: m.profile_rank_sage,
  archivist: m.profile_rank_archivist,
  grandmaster: m.profile_rank_grandmaster,
}
