import { isTagKey, tags } from "@taiyomoe/config"
import type { Media } from "@/features/media/api/medias"
import { localizeTagName } from "@/lib/locale"

export const getMediaTags = (mediaTags: Media["tags"]) =>
  (mediaTags ?? []).flatMap(({ key, isSpoiler }) => {
    if (!isTagKey(key)) {
      return []
    }

    const tag = tags[key]

    return [{ key, isSpoiler, isGenre: tag.category === "Genre", name: localizeTagName(tag.name) }]
  })
