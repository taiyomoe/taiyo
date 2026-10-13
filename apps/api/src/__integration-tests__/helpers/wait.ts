import type { MediaDocument } from "@taiyomoe/search"
import type { Services } from "../../services"

export const waitForMediaDoc = async (
  { meili, mediasIndex }: Services,
  mediaId: string,
  until: (doc: MediaDocument | null) => boolean,
  { attempts = 100, intervalMs = 100 } = {},
) => {
  let last: MediaDocument | null = null

  for (let i = 0; i < attempts; i++) {
    last = await meili
      .index<MediaDocument>(mediasIndex)
      .getDocument(mediaId)
      .catch(() => null)

    if (until(last)) {
      return last
    }

    await new Promise<void>((r) => {
      setTimeout(r, intervalMs)
    })
  }

  throw new Error(`Media document ${mediaId} never settled; last seen: ${JSON.stringify(last)}`)
}
