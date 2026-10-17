import { type ContentRating, type DB, type Kysely, type Language, sql } from "@taiyomoe/db"
import { selectVisibleChapters } from "./latest-chapters"

export const NO_VOLUME = "none"

export type MediaChapterFilters = {
  contentRatings: ContentRating[]
  language?: Language | undefined
  volume?: string | undefined
  search?: string | undefined
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (match) => `\\${match}`)

export const selectMediaChapters = (
  db: Kysely<DB>,
  mediaId: string,
  { contentRatings, language, volume, search }: MediaChapterFilters,
) =>
  selectVisibleChapters(db, { contentRatings, mediaId }).where((eb) =>
    eb.and([
      ...(language === undefined ? [] : [eb("chapters.language", "=", language)]),
      ...(volume === undefined
        ? []
        : [
            volume === NO_VOLUME
              ? eb("chapters.volume", "is", null)
              : eb("chapters.volume", "=", volume),
          ]),
      ...(search === undefined || search === ""
        ? []
        : [
            eb.or([
              eb(
                sql<string>`${sql.ref("chapters.number")}::text`,
                "like",
                `${escapeLike(search)}%`,
              ),
              eb("chapters.title", "ilike", `%${escapeLike(search)}%`),
            ]),
          ]),
    ]),
  )

export const selectReadChapterNumber = (db: Kysely<DB>, userId: string) =>
  db
    .selectFrom("userHistories")
    .innerJoin("chapters as read", "read.id", "userHistories.chapterId")
    .select(sql.lit(1).as("one"))
    .where("userHistories.userId", "=", userId)
    .where("read.deletedAt", "is", null)
    .where("read.mediaId", "=", sql.ref<string>("chapters.mediaId"))
    .where("read.number", "=", sql.ref<number>("chapters.number"))
