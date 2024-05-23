import { meilisearch, meilisearchIndexes } from "@taiyomoe/meilisearch"
import {
  getMediaIndexItem,
  getScanIndexItem,
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
}

export default { execute }
