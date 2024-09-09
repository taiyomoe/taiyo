import { meilisearchClient, rawMeilisearchClient } from "@taiyomoe/meilisearch"
import {
  ChaptersIndexService,
  MediasIndexService,
  UsersIndexService,
} from "@taiyomoe/meilisearch/services"
import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import { db } from "../../"

const execute = async () => {
  // Medias
  const medias = await db.media.findMany()
  const mediaFields = ["type"]

  await rawMeilisearchClient.deleteIndexIfExists("medias")
  await rawMeilisearchClient.createIndex("medias", { primaryKey: "id" })
  await meilisearchClient.medias.updateFilterableAttributes(mediaFields)
  await meilisearchClient.medias.updateSortableAttributes(mediaFields)
  await meilisearchClient.medias.deleteAllDocuments()
  await MediasIndexService.sync(
    db,
    medias.map((s) => s.id),
  )

  // Scans
  const scans = await db.scan.findMany()
  const scanFields = [
    "id",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "name",
    "description",
    "logo",
    "banner",
    "website",
    "discord",
    "twitter",
    "facebook",
    "instagram",
    "telegram",
    "youtube",
    "email",
    "creatorId",
    "deleterId",
  ]

  await rawMeilisearchClient.deleteIndexIfExists("scans")
  await rawMeilisearchClient.createIndex("scans", { primaryKey: "id" })
  await meilisearchClient.scans.updateFilterableAttributes(scanFields)
  await meilisearchClient.scans.updateSortableAttributes(scanFields)
  await meilisearchClient.scans.deleteAllDocuments()
  await ScansIndexService.sync(
    db,
    scans.map((s) => s.id),
  )

  // Chapters
  const chapters = await db.mediaChapter.findMany()
  const chapterFields = [
    "id",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "title",
    "number",
    "volume",
    "language",
    "contentRating",
    "flag",
    "scanIds",
    "uploaderId",
    "mediaId",
    "deleterId",
  ]

  await rawMeilisearchClient.deleteIndexIfExists("chapters")
  await rawMeilisearchClient.createIndex("chapters", { primaryKey: "id" })
  await meilisearchClient.chapters.updateFilterableAttributes(chapterFields)
  await meilisearchClient.chapters.updateSortableAttributes(chapterFields)
  await meilisearchClient.chapters.deleteAllDocuments()
  await ChaptersIndexService.sync(
    db,
    chapters.map((s) => s.id),
  )

  // Users
  const users = await db.user.findMany()
  const userFields = ["name"]

  await rawMeilisearchClient.deleteIndexIfExists("users")
  await rawMeilisearchClient.createIndex("users", { primaryKey: "id" })
  await meilisearchClient.users.updateFilterableAttributes(userFields)
  await meilisearchClient.users.updateSortableAttributes(userFields)
  await meilisearchClient.users.deleteAllDocuments()
  await UsersIndexService.sync(
    db,
    users.map((s) => s.id),
  )
}

export default { execute }
