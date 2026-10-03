import type { Services } from "../../services"

export const waitForMeiliMediaDoc = async (
  { meili, mediasIndex }: Services,
  mediaId: string,
  { attempts = 20, intervalMs = 100 } = {},
) => {
  for (let i = 0; i < attempts; i++) {
    const doc = await meili
      .index(mediasIndex)
      .getDocument(mediaId)
      .catch(() => null)

    if (doc) {
      return doc
    }

    await new Promise<void>((r) => setTimeout(r, intervalMs))
  }

  return null
}
