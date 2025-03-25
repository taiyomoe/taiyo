import { meilisearchClient, rawMeilisearchClient } from "@taiyomoe/meilisearch"
import {
  MediasIndexService,
  UsersIndexService,
} from "@taiyomoe/meilisearch/services"
import { GroupsIndexService } from "@taiyomoe/meilisearch/services"
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

  await rawMeilisearchClient.deleteIndexIfExists("medias")
  await rawMeilisearchClient.createIndex("medias", { primaryKey: "id" })
  await meilisearchClient.medias.updateFilterableAttributes(mediaFields)
  await meilisearchClient.medias.updateSortableAttributes(mediaFields)
  await meilisearchClient.medias.deleteAllDocuments()
  await MediasIndexService.sync(
    db,
    medias.map((s) => s.id),
  )

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

  await rawMeilisearchClient.deleteIndexIfExists("groups")
  await rawMeilisearchClient.createIndex("groups", { primaryKey: "id" })
  await meilisearchClient.groups.updateFilterableAttributes(groupFields)
  await meilisearchClient.groups.updateSortableAttributes(groupFields)
  await meilisearchClient.groups.deleteAllDocuments()
  await GroupsIndexService.sync(
    db,
    groups.map((s) => s.id),
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
