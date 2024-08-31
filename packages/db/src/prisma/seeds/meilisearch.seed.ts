import { meilisearch, meilisearchIndexes } from "@taiyomoe/meilisearch"
import {
  getChapterIndexItem,
  getMediaIndexItem,
  getScanIndexItem,
  getUserIndexItem,
} from "@taiyomoe/meilisearch/utils"
import { db } from "../.."

const execute = async () => {
  // Medias
  await meilisearch.deleteIndexIfExists("medias")
  await meilisearch.createIndex("medias", { primaryKey: "id" })
  await meilisearchIndexes.medias.updateFilterableAttributes(["type"])
  await meilisearchIndexes.medias.deleteAllDocuments()

  const medias = await Promise.all(
    (await db.media.findMany()).map(({ id }) => getMediaIndexItem(db, id)),
  )

  await meilisearchIndexes.medias.updateDocuments(medias)

  // Scans
  await meilisearch.deleteIndexIfExists("scans")
  await meilisearch.createIndex("scans", { primaryKey: "id" })
  await meilisearchIndexes.scans.deleteAllDocuments()

  const scans = await Promise.all(
    (await db.scan.findMany()).map(({ id }) => getScanIndexItem(db, id)),
  )

  await meilisearchIndexes.scans.updateDocuments(scans)

  // Chapters
  const fields = [
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
  await meilisearch.deleteIndexIfExists("chapters")
  await meilisearch.createIndex("chapters", { primaryKey: "id" })
  await meilisearch.index("chapters").updateFilterableAttributes(fields)
  await meilisearch.index("chapters").updateSortableAttributes(fields)
  await meilisearchIndexes.chapters.deleteAllDocuments()

  const chapters = await Promise.all(
    (await db.mediaChapter.findMany()).map(({ id }) =>
      getChapterIndexItem(db, id),
    ),
  )

  await meilisearchIndexes.chapters.updateDocuments(chapters)

  // Users
  await meilisearch.deleteIndexIfExists("users")
  await meilisearch.createIndex("users", { primaryKey: "id" })
  await meilisearch.index("users").updateFilterableAttributes(["name"])
  await meilisearch.index("users").updateSortableAttributes(["name"])
  await meilisearchIndexes.users.deleteAllDocuments()

  const users = await Promise.all(
    (await db.user.findMany()).map(({ id }) => getUserIndexItem(db, id)),
  )

  await meilisearchIndexes.users.updateDocuments(users)
}

export default { execute }
