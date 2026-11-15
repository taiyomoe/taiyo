import type {
  ChapterStatus,
  ContentRating,
  GroupMembershipRole,
  GroupPermission,
  Language,
} from "@taiyomoe/db"
import { sql } from "@taiyomoe/db"
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
  status?: ChapterStatus
  pages?: Array<{ id: string }> | null
  publishInHours?: number
  externalUrl?: string | null
  isExternal?: boolean
}

export const seedChapter = async (
  { db }: Services,
  {
    groupIds = [],
    language = "en",
    volume = null,
    title = null,
    createdAt = new Date(),
    publishInHours,
    ...chapter
  }: ChapterSeed,
) => {
  const id = randomUUID()
  const publishAt =
    publishInHours === undefined
      ? null
      : sql<Date>`(CURRENT_TIMESTAMP at time zone 'UTC') + make_interval(hours => ${publishInHours})`

  await db
    .insertInto("chapters")
    .values({ id, language, volume, title, createdAt, publishAt, ...chapter })
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

export const seedTitle = async (
  { db }: Services,
  {
    mediaId,
    creatorId,
    title,
    language = "en",
    priority = 1,
    isMainTitle = false,
  }: {
    mediaId: string
    creatorId: string
    title: string
    language?: Language
    priority?: number
    isMainTitle?: boolean
  },
) => {
  const { id } = await db
    .insertInto("titles")
    .values({ mediaId, creatorId, title, language, priority, isMainTitle })
    .returning("id")
    .executeTakeFirstOrThrow()

  return id
}

export const seedStaff = async ({ db }: Services, creatorId: string, name: string) => {
  const { id } = await db
    .insertInto("staffs")
    .values({ creatorId, name })
    .returning("id")
    .executeTakeFirstOrThrow()

  return id
}
