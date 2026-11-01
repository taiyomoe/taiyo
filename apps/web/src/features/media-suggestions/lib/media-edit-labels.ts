import type { StaffRole } from "@taiyomoe/db/constants"
import { config } from "@taiyomoe/config"
import { m } from "@/paraglide/messages"

export const TAG_OPTIONS = Object.entries(config.tags)
  .map(([key, tag]) => ({ key, name: tag.name.en, category: tag.category }))
  .sort((a, b) => a.name.localeCompare(b.name))

const TAG_NAMES = new Map(TAG_OPTIONS.map((tag) => [tag.key, tag.name]))

export const getTagName = (key: string) => TAG_NAMES.get(key) ?? key

export const STAFF_ROLE_LABELS: Record<StaffRole, () => string> = {
  AUTHOR: m.media_info_authors,
  ARTIST: m.media_info_artists,
}
