import type { RankingPeriodKind } from "../rankings"
import type { Generated, Timestamp } from "../types"

export type RankingPeriod = {
  id: Generated<string>
  kind: RankingPeriodKind
  startsAt: Timestamp
  endsAt: Timestamp
  closedAt: Generated<Timestamp>
}
