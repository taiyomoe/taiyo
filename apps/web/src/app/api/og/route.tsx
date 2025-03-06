import { z } from "zod"
import { DefaultOGCard } from "~/components/og/default-og-card"
import { MediaOGCard } from "~/components/og/media-og-card"

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const mediaId = z.string().uuid().safeParse(searchParams.get("mediaId")).data
  const chapterId = z
    .string()
    .uuid()
    .safeParse(searchParams.get("chapterId")).data

  if (!mediaId && !chapterId) {
    return DefaultOGCard
  }

  if (mediaId) {
    return MediaOGCard({ mediaId })
  }

  return DefaultOGCard
}
