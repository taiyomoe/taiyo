import type { ContentRating, RankingPeriodKind } from "@taiyomoe/db"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { seedChapter, seedMedia } from "../helpers/seed"

export const DAY_MS = 86_400_000

/** A published chapter of a fresh media, for credited reads to point at. */
export const seedReadingTarget = async (
  services: Services,
  contentRating: ContentRating = "NORMAL",
) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId, contentRating)
  const chapterId = await seedChapter(services, { mediaId, uploaderId, number: 1 })

  return { mediaId, chapterId }
}

/** Credits `chapters` chapter reads of `pages` pages each to the user, all at `at`. */
export const creditChapters = async (
  { db }: Services,
  {
    userId,
    target,
    at,
    chapters = 1,
    pages = 20,
  }: {
    userId: string
    target: { mediaId: string; chapterId: string }
    at: Date
    chapters?: number
    pages?: number
  },
) => {
  await db
    .insertInto("readingRewards")
    .values(
      Array.from({ length: chapters }, (_, index) => ({
        userId,
        chapterId: target.chapterId,
        mediaId: target.mediaId,
        number: index + 1,
        pages,
        points: 1,
        createdAt: at,
      })),
    )
    .execute()
}

/** Marks every period of `kind` ending by `endsAt` as closed, so a run only closes later ones. */
export const setWatermark = async (
  { db }: Services,
  kind: RankingPeriodKind,
  startsAt: Date,
  endsAt: Date,
) => {
  await db.insertInto("rankingPeriods").values({ kind, startsAt, endsAt }).execute()
}
