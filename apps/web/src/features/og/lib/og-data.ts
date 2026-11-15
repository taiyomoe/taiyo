import type { AppType } from "@taiyomoe/api/app"
import { config } from "@taiyomoe/config"
import { hc } from "hono/client"
import { z } from "zod"
import type { OgKind } from "@/features/og/lib/og-meta"
import { getRichTextSummary } from "@/components/rich-text/rich-text-document"
import { env } from "@/env/client"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { getMainTitle, getSynopsis } from "@/features/media/lib/media-labels"
import {
  chapterOgCard,
  groupOgCard,
  listOgCard,
  mediaOgCard,
  type OgCard,
  userOgCard,
} from "@/features/og/lib/og-cards"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

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
const PREVIEWS: Record<
  OgKind,
  (id: string) => Promise<{ title: string | null; description: string | null }>
> = {
  media: async (id) => {
    const media = await loadMedia(id)

    return {
      title: getMainTitle(media.titles),
      description: getRichTextSummary(getSynopsis(media.synopsis)),
    }
  },
  chapters: async (id) => {
    const chapter = await unwrap(await api.chapters[":id"].$get({ param: { id } }))
    const media = await loadMedia(chapter.mediaId)

    return {
      title: `${getChapterLabel(chapter)} · ${getMainTitle(media.titles) ?? m.media_untitled()}`,
      description: null,
    }
  },
  users: async (username) => {
    const user = await loadUser(username)

    return {
      title: user.displayUsername,
      description: getRichTextSummary(Object.values(user.about).find(Boolean)),
    }
  },
  groups: async (id) => {
    const group = await unwrap(await api.groups[":id"].$get({ param: { id } }))

    return { title: group.name, description: getRichTextSummary(group.description) }
  },
  lists: async (id) => {
    const list = await loadList(id)

    return { title: list.name, description: getRichTextSummary(list.description) }
  },
}
const isPageId = (kind: OgKind, id: string) => kind === "users" || uuid.safeParse(id).success

/** Builds the card of a page, or null when the page does not exist or is not public. */
export const loadOgCard = async (kind: OgKind, id: string, host: string) =>
  isPageId(kind, id) ? LOADERS[kind](id, host).catch(() => null) : null

/** The text of a page's link preview, or null when the page does not exist or is not public. */
export const loadOgPreview = async (kind: OgKind, id: string) =>
  isPageId(kind, id) ? PREVIEWS[kind](id).catch(() => null) : null
