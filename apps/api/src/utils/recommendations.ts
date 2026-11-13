import {
  type ContentRating,
  type DB,
  type Kysely,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_TYPES,
  USER_LIBRARY_STATUSES,
} from "@taiyomoe/db"
import z from "zod"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"
import { contentRatingSchema } from "./schemas"

export const recommendedMediaSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  title: z.string().nullable().meta({ description: "The main title of the media." }),
  coverUrl: z.url().nullable().meta({ description: "URL of the media's main cover." }),
  type: z.enum(MEDIA_TYPES),
  countryOfOrigin: z.enum(MEDIA_COUNTRIES_OF_ORIGIN),
  contentRating: contentRatingSchema("The content rating of the media."),
  libraryStatus: z
    .enum(USER_LIBRARY_STATUSES)
    .nullable()
    .meta({ description: "Where the media sits in your library, or null when signed out." }),
})

export const getRecommendedMedias = async (
  db: Kysely<DB>,
  {
    mediaIds,
    contentRatings,
    viewerId,
  }: { mediaIds: readonly string[]; contentRatings: ContentRating[]; viewerId: string | null },
) => {
  if (mediaIds.length === 0) {
    return new Map<string, z.infer<typeof recommendedMediaSchema>>()
  }

  const ids = [...mediaIds]
  const [medias, titles, covers, library] = await Promise.all([
    db
      .selectFrom("medias")
      .select(["id", "type", "countryOfOrigin", "contentRating"])
      .where("id", "in", ids)
      .where("deletedAt", "is", null)
      .where("contentRating", "in", contentRatings)
      .execute(),
    getMainTitles(db, ids),
    getMainCoverUrls(db, ids),
    viewerId === null
      ? []
      : db
          .selectFrom("userLibraryEntries")
          .select(["mediaId", "status"])
          .where("userId", "=", viewerId)
          .where("mediaId", "in", ids)
          .execute(),
  ])
  const statuses = new Map(library.map((entry) => [entry.mediaId, entry.status]))

  return new Map(
    medias.map((media) => [
      media.id,
      {
        ...media,
        title: titles.get(media.id) ?? null,
        coverUrl: covers.get(media.id) ?? null,
        libraryStatus: statuses.get(media.id) ?? null,
      } satisfies z.infer<typeof recommendedMediaSchema>,
    ]),
  )
}
