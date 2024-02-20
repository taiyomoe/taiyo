import { MediaService } from "@taiyomoe/services"
import { ScanService } from "@taiyomoe/services"
import { db } from "~/lib/server/db"
import { meilisearch, meilisearchIndexes } from "~/lib/server/meilisearch"

const execute = async () => {
  // Medias
  await meilisearch.deleteIndexIfExists("medias")
  await meilisearch.createIndex("medias", { primaryKey: "id" })
  await meilisearchIndexes.medias.deleteAllDocuments()

  const medias = await Promise.all(
    (await db.media.findMany()).map(({ id }) => MediaService.getIndexItem(id)),
  )

  await meilisearchIndexes.medias.updateDocuments(medias)

  // Scans
  await meilisearch.deleteIndexIfExists("scans")
  await meilisearch.createIndex("scans", { primaryKey: "id" })
  await meilisearchIndexes.scans.deleteAllDocuments()

  const scans = await Promise.all(
    (await db.scan.findMany()).map(({ id }) => ScanService.getIndexItem(id)),
  )

  await meilisearchIndexes.scans.updateDocuments(scans)
}

export default { execute }
