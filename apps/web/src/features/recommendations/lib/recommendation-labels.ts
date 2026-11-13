import type { MediaRelationType } from "@taiyomoe/db/constants"
import { config } from "@taiyomoe/config"
import type { RelatedMedias } from "@/features/recommendations/api/recommendations"
import { isTagKey } from "@/features/advanced-search/lib/search-tags"
import { m } from "@/paraglide/messages"

type Reasons = RelatedMedias["similar"][number]["reasons"]

export const RELATION_TYPE_LABELS: Record<MediaRelationType, () => string> = {
  PREQUEL: m.relation_prequel,
  SEQUEL: m.relation_sequel,
  MAIN_STORY: m.relation_main_story,
  SIDE_STORY: m.relation_side_story,
  ORIGINAL: m.relation_original,
  ADAPTATION: m.relation_adaptation,
  ALTERNATE_VERSION: m.relation_alternate_version,
  ALTERNATE_STORY: m.relation_alternate_story,
  SAME_FRANCHISE: m.relation_same_franchise,
}

export const getReasonText = ({ tags, staff, readers }: Reasons) => {
  const tagNames = tags.filter(isTagKey).map((key) => config.tags[key].name.en)
  const parts = [
    ...(staff ? [m.related_reason_creator()] : []),
    ...tagNames.slice(0, staff ? 1 : 2),
  ]

  if (parts.length === 0 && readers) {
    return m.related_reason_readers()
  }

  return parts.length === 0 ? null : parts.join(" · ")
}
