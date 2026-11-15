import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestUrl } from "@tanstack/react-start/server"
import type { FileRoutesById } from "@/routeTree.gen"
import { OG_HEIGHT, OG_WIDTH } from "@/features/og/lib/og-theme"

export const OG_KINDS = ["media", "chapters", "users", "groups", "lists"] as const

export type OgKind = (typeof OG_KINDS)[number]

/** The pages that draw their own card, through `pageOgMeta`. */
const CARD_ROUTES: Array<keyof FileRoutesById> = [
  "/media/$mediaId",
  "/chapters/$chapterId/",
  "/users/$username",
  "/groups/$groupId",
  "/lists/$listId",
]
const VIDEO = { path: "/og/taiyo.mp4", width: 1200, height: 630 }
const POSTER = "/og/taiyo.jpg"
const DESCRIPTION_LENGTH = 200

/** The origin crawlers reached the page on, behind any proxy: og: URLs must be absolute. */
export const getOrigin = createIsomorphicFn()
  .server(() => getRequestUrl({ xForwardedHost: true }).origin)
  .client(() => window.location.origin)

const truncate = (text: string) =>
  text.length <= DESCRIPTION_LENGTH ? text : `${text.slice(0, DESCRIPTION_LENGTH - 1).trimEnd()}…`
const image = (url: string, alt: string) => [
  { property: "og:image", content: url },
  { property: "og:image:type", content: "image/jpeg" },
  { property: "og:image:width", content: String(OG_WIDTH) },
  { property: "og:image:height", content: String(OG_HEIGHT) },
  { property: "og:image:alt", content: alt },
  { name: "twitter:card", content: "summary_large_image" },
]

/**
 * The site-wide preview: the landing page's sun as a looping video, with its
 * first frame as the image for the many apps that do not play video. Pages
 * with their own card leave it out, or Discord and iMessage would play the
 * sun instead of showing the page.
 */
export const siteOgMeta = (routeIds: string[]) => {
  if (CARD_ROUTES.some((route) => routeIds.includes(route))) {
    return [{ property: "og:site_name", content: "Taiyō" }]
  }

  const origin = getOrigin()
  const video = `${origin}${VIDEO.path}`

  return [
    { property: "og:site_name", content: "Taiyō" },
    { property: "og:type", content: "video.other" },
    { property: "og:video", content: video },
    { property: "og:video:secure_url", content: video },
    { property: "og:video:type", content: "video/mp4" },
    { property: "og:video:width", content: String(VIDEO.width) },
    { property: "og:video:height", content: String(VIDEO.height) },
    ...image(`${origin}${POSTER}`, "Taiyō"),
  ]
}

/** A page's own card, drawn by the /og/$kind/$id route. */
export const pageOgMeta = ({
  kind,
  id,
  title,
  description,
  type = "website",
}: {
  kind: OgKind
  id: string
  title: string | null
  description?: string | null | undefined
  type?: "website" | "profile"
}) => [
  { property: "og:type", content: type },
  ...(title === null ? [] : [{ property: "og:title", content: title }]),
  ...(description === null || description === undefined || description === ""
    ? []
    : [
        { name: "description", content: truncate(description) },
        { property: "og:description", content: truncate(description) },
      ]),
  ...image(`${getOrigin()}/og/${kind}/${encodeURIComponent(id)}`, title ?? "Taiyō"),
]
