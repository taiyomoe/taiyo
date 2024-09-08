import { meilisearchClient, rawMeilisearchClient } from "@taiyomoe/meilisearch"
import { ChaptersIndexService } from "@taiyomoe/meilisearch/services"
import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import {
  getMediaIndexItem,
  getUserIndexItem,
} from "@taiyomoe/meilisearch/utils"
import { db } from "../.."

const execute = async () => {
  // Medias
  await rawMeilisearchClient.deleteIndexIfExists("medias")
  await rawMeilisearchClient.createIndex("medias", { primaryKey: "id" })
  await meilisearchClient.medias.updateFilterableAttributes(["type"])
  await meilisearchClient.medias.deleteAllDocuments()

  const medias = await Promise.all(
    (await db.media.findMany()).map(({ id }) => getMediaIndexItem(db, id)),
  )

  await meilisearchClient.medias.updateDocuments(medias)

  // Scans
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

  const scans = await Promise.all(
    (await db.scan.findMany()).map(({ id }) =>
      ScansIndexService.getItem(db, id),
    ),
  )

  await meilisearchClient.scans.updateDocuments(scans)

  // Chapters
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

  const chapters = await Promise.all(
    (await db.mediaChapter.findMany()).map(({ id }) =>
      ChaptersIndexService.getItem(db, id),
    ),
  )

  await meilisearchClient.chapters.updateDocuments(chapters)

  // Users
  await rawMeilisearchClient.deleteIndexIfExists("users")
  await rawMeilisearchClient.createIndex("users", { primaryKey: "id" })
  await meilisearchClient.users.updateFilterableAttributes(["name"])
  await meilisearchClient.users.updateSortableAttributes(["name"])
  await meilisearchClient.users.deleteAllDocuments()

  const users = await Promise.all(
    (await db.user.findMany()).map(({ id }) => getUserIndexItem(db, id)),
  )

  await meilisearchClient.users.updateDocuments(users)
}

export default { execute }
