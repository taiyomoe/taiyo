import type { ContentRating, GroupMembershipRole, GroupPermission, Language } from "@taiyomoe/db"
import { randomUUID } from "node:crypto"
import type { Services } from "../../services"

export const seedMedia = async (
  { db }: Services,
  creatorId: string,
  contentRating: ContentRating = "NORMAL",
) => {
  const id = randomUUID()

  await db
    .insertInto("medias")
    .values({
      id,
      creatorId,
      contentRating,
      type: "MANGA",
      status: "RELEASING",
      source: "ORIGINAL",
      demography: "SHOUNEN",
      countryOfOrigin: "JAPAN",
    })
    .execute()

  return id
}

export const seedGroup = async ({ db }: Services, creatorId: string, name: string) => {
  const id = randomUUID()

  await db.insertInto("groups").values({ id, name, creatorId }).execute()

  return id
}

type ChapterSeed = {
  mediaId: string
  uploaderId: string
  number: number
  language?: Language
  volume?: string | null
  title?: string | null
  contentRating?: ContentRating
  createdAt?: Date
  groupIds?: string[]
}

export const seedChapter = async (
  { db }: Services,
  {
    groupIds = [],
    language = "en",
    volume = null,
    title = null,
    createdAt = new Date(),
    ...chapter
  }: ChapterSeed,
) => {
  const id = randomUUID()

  await db
    .insertInto("chapters")
    .values({ id, language, volume, title, createdAt, ...chapter })
    .execute()

  if (groupIds.length > 0) {
    await db
      .insertInto("chapterGroups")
      .values(groupIds.map((groupId) => ({ chapterId: id, groupId })))
      .execute()
  }

  return id
}

export const seedHistory = async (
  { db }: Services,
  userId: string,
  chapterId: string,
  updatedAt = new Date(),
) => {
  await db.insertInto("userHistories").values({ userId, chapterId, updatedAt }).execute()
}

export const seedMembership = async (
  { db }: Services,
  {
    groupId,
    userId,
    role = "MEMBER",
    permissions = [],
  }: {
    groupId: string
    userId: string
    role?: GroupMembershipRole
    permissions?: GroupPermission[]
  },
) => {
  await db
    .insertInto("groupMemberships")
    .values({ groupId, userId, role, permissions, addedBy: userId })
    .execute()
}
