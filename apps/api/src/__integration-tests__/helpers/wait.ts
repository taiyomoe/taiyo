import { SEARCH_INDEXES } from "@taiyomoe/search"
import type { Services } from "../../services"

export const waitForMeiliMediaDoc = async (
  { meili }: Services,
  mediaId: string,
  { attempts = 20, intervalMs = 100 } = {},
) => {
  for (let i = 0; i < attempts; i++) {
    const doc = await meili
      .index(SEARCH_INDEXES.MEDIAS)
      .getDocument(mediaId)
      .catch(() => null)

    if (doc) {
      return doc
    }

    await new Promise<void>((r) => setTimeout(r, intervalMs))
  }

  return null
}
