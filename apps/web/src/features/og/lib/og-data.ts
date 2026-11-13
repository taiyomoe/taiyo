import type { AppType } from "@taiyomoe/api/app"
import { config } from "@taiyomoe/config"
import { hc } from "hono/client"
import { z } from "zod"
import type { OgKind } from "@/features/og/lib/og-meta"
import { env } from "@/env/client"
import {
  chapterOgCard,
  groupOgCard,
  listOgCard,
  mediaOgCard,
  type OgCard,
  userOgCard,
} from "@/features/og/lib/og-cards"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

// Cards are cached and shared, so they are always drawn as an anonymous
// visitor sees the page: the app's own client would forward the viewer's
// cookie and could put a private list into a public image.
const api = hc<AppType>(env.VITE_API_URL)
const contentRating = config.settings.contentRating.join(",")
const uuid = z.uuid()
const loadMedia = async (id: string) => {
  const response = await api.medias[":id"].$get({ param: { id } })

  return (await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)).data
}
const loadUser = async (username: string) => {
  const response = await api.users["by-username"][":username"].$get({ param: { username } })

  return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
}
const loadList = async (id: string) => {
  const response = await api.lists[":id"].$get({ param: { id }, query: { contentRating } })

  return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
}
const loadChapter = async (id: string, host: string) => {
  const chapter = await unwrap(await api.chapters[":id"].$get({ param: { id } }))
  const [media, reader] = await Promise.all([
    loadMedia(chapter.mediaId),
    // The credits are a bonus: the card still draws without them.
    api.chapters[":id"].reader
      .$get({ param: { id }, query: { contentRating } })
      .then(unwrap)
      .catch(() => null),
  ])

  return chapterOgCard(
    { chapter, media, entry: reader?.chapters.find((entry) => entry.id === id) },
    host,
  )
}
const LOADERS: Record<OgKind, (id: string, host: string) => Promise<OgCard>> = {
  media: async (id, host) => mediaOgCard(await loadMedia(id), host),
  chapters: loadChapter,
  users: async (username, host) => userOgCard(await loadUser(username), host),
  groups: async (id, host) =>
    groupOgCard(await unwrap(await api.groups[":id"].$get({ param: { id } })), host),
  lists: async (id, host) => listOgCard(await loadList(id), host),
}

/** Builds the card of a page, or null when the page does not exist or is not public. */
export const loadOgCard = async (kind: OgKind, id: string, host: string) =>
  kind !== "users" && !uuid.safeParse(id).success ? null : LOADERS[kind](id, host).catch(() => null)
