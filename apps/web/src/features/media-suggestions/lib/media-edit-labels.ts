import type { StaffRole } from "@taiyomoe/db/constants"
import { isTagKey, tags } from "@taiyomoe/config"
import { localizeTagName } from "@/lib/locale"
import { m } from "@/paraglide/messages"

export const getTagOptions = () =>
  Object.entries(tags)
    .map(([key, tag]) => ({ key, name: localizeTagName(tag.name), category: tag.category }))
    .sort((a, b) => a.name.localeCompare(b.name))

export const getTagName = (key: string) => (isTagKey(key) ? localizeTagName(tags[key].name) : key)

export const STAFF_ROLE_LABELS: Record<StaffRole, () => string> = {
  AUTHOR: m.media_info_authors,
  ARTIST: m.media_info_artists,
}
