import { loadOgPreview } from "@/features/og/lib/og-data"
import { type OgKind, pageOgMeta } from "@/features/og/lib/og-meta"

// Pages sit behind sign-in, but the apps that unfurl a shared link fetch it without a session.
// They get a document holding only the page's preview tags, never the page itself.
const LINK_PREVIEW_CRAWLERS =
  /Discordbot|Slackbot|Twitterbot|facebookexternalhit|Facebot|WhatsApp|TelegramBot|LinkedInBot|redditbot|SkypeUriPreview|Mastodon|Cardyb|Iframely|Embedly/i
const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ENTITIES[char] ?? char)

export const serveLinkPreview = async <TNext>({
  request,
  next,
  kind,
  id,
}: {
  request: Request
  next: () => TNext
  kind: OgKind
  id: string
}) => {
  if (!LINK_PREVIEW_CRAWLERS.test(request.headers.get("user-agent") ?? "")) {
    return next()
  }

  const preview = await loadOgPreview(kind, id)

  if (preview === null) {
    return next()
  }

  const tags = [
    { property: "og:site_name", content: "Taiyō" },
    { name: "theme-color", content: "#120a07" },
    ...pageOgMeta({ kind, id, ...preview, type: kind === "users" ? "profile" : "website" }),
  ].map(
    (tag) =>
      `<meta ${Object.entries(tag)
        .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
        .join(" ")}>`,
  )

  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(preview.title ?? "Taiyō")}</title>${tags.join("")}</head><body></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  )
}
