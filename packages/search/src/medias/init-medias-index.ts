import { db } from "@taiyomoe/db"
import { isNullish } from "radashi"
import { meiliClient, SEARCH_INDEXES } from "../client"
import { INDEXES_BATCH_SIZE } from "../utils/constants"
import { getMediaDocument, MediaDocument } from "./get-media-document"

const filterableAttributes = [
  "type",
  "status",
  "source",
  "demography",
  "countryOfOrigin",
  "contentRating",
  "flag",
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "tagKeys",
  "spoilerTagKeys",
  "linkProviders",
  "titleLanguages",
  "chapterLanguages",
  "coverLanguages",
  "authorIds",
  "artistIds",
] satisfies (keyof MediaDocument)[]
const searchableAttributes = ["titles", "synopsis", "staffNames"] satisfies (keyof MediaDocument)[]
const sortableAttributes = [
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "_sortMainTitle",
] satisfies (keyof MediaDocument)[]

export const initMediasIndex = async () => {
  await meiliClient.createIndex(SEARCH_INDEXES.MEDIAS, { primaryKey: "id" }).catch(() => {
    // Index already exists. Meilisearch returns an error we deliberately ignore.
  })

  await meiliClient.index(SEARCH_INDEXES.MEDIAS).updateSettings({
    searchableAttributes,
    filterableAttributes,
    sortableAttributes,
  })

  const ids = await db.selectFrom("medias").select("id").where("deletedAt", "is", null).execute()

  // oxlint-disable-next-line no-console
  console.log(`Reindexing ${ids.length} medias in batches of ${INDEXES_BATCH_SIZE}...`)

  for (let i = 0; i < ids.length; i += INDEXES_BATCH_SIZE) {
    const batch = ids.slice(i, i + INDEXES_BATCH_SIZE)
    const rawDocuments = await Promise.all(batch.map((row) => getMediaDocument(db, row.id)))
    const filtered = rawDocuments.filter((doc) => !isNullish(doc))

    await meiliClient.index(SEARCH_INDEXES.MEDIAS).addDocuments(filtered)

    // oxlint-disable-next-line no-console
    console.log(`  pushed ${i + batch.length} / ${ids.length}`)
  }
}
