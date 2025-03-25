import {
  getGroupIndexItem,
  getMediaIndexItem,
  getUserIndexItem,
  meilisearchClient,
  rawMeilisearchClient,
} from "@taiyomoe/meilisearch"
import { db } from "../../"

const execute = async () => {
  // Medias
  const medias = await db.media.findMany()
  const mediaFields = [
    "id",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "startDate",
    "endDate",
    "synopsis",
    "contentRating",
    "oneShot",
    "trailer",
    "type",
    "status",
    "source",
    "demography",
    "countryOfOrigin",
    "genres",
    "tags",
    "flag",
    "creatorId",
    "deleterId",
  ]
  const mediaIndexItems = await Promise.all(
    medias.map((s) => getMediaIndexItem(db, s.id)),
  )

  await rawMeilisearchClient.deleteIndexIfExists("medias")
  await rawMeilisearchClient.createIndex("medias", { primaryKey: "id" })
  await meilisearchClient.medias.updateFilterableAttributes(mediaFields)
  await meilisearchClient.medias.updateSortableAttributes(mediaFields)
  await meilisearchClient.medias.deleteAllDocuments()
  await meilisearchClient.medias.addDocuments(mediaIndexItems)

  // Groups
  const groups = await db.group.findMany()
  const groupFields = [
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
  const groupIndexItems = await Promise.all(
    groups.map((s) => getGroupIndexItem(db, s.id)),
  )

  await rawMeilisearchClient.deleteIndexIfExists("groups")
  await rawMeilisearchClient.createIndex("groups", { primaryKey: "id" })
  await meilisearchClient.groups.updateFilterableAttributes(groupFields)
  await meilisearchClient.groups.updateSortableAttributes(groupFields)
  await meilisearchClient.groups.deleteAllDocuments()
  await meilisearchClient.groups.addDocuments(groupIndexItems)

  // Users
  const users = await db.user.findMany()
  const userFields = ["name"]
  const userIndexItems = await Promise.all(
    users.map((s) => getUserIndexItem(db, s.id)),
  )

  await rawMeilisearchClient.deleteIndexIfExists("users")
  await rawMeilisearchClient.createIndex("users", { primaryKey: "id" })
  await meilisearchClient.users.updateFilterableAttributes(userFields)
  await meilisearchClient.users.updateSortableAttributes(userFields)
  await meilisearchClient.users.deleteAllDocuments()
  await meilisearchClient.users.addDocuments(userIndexItems)
}

export default { execute }
