import type { DB, Kysely } from "@taiyomoe/db"
import type { Meilisearch } from "meilisearch"
import { isNullish } from "radashi"
import { INDEXES_BATCH_SIZE } from "../utils/constants"
import { getMediaDocument, type MediaDocument } from "./get-media-document"

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
  "libraryCount",
  "chapterCount",
] satisfies Array<keyof MediaDocument>
const searchableAttributes = ["mainTitle.title", "titles", "synopsis", "staffNames"]
const sortableAttributes = [
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "_sortMainTitle",
  "libraryCount",
  "chapterCount",
] satisfies Array<keyof MediaDocument>
const displayedAttributes = [
  "id",
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
  "titles",
  "synopsis",
  "staffNames",
  "authorIds",
  "artistIds",
  "mainTitle",
  "mainCoverId",
  "libraryCount",
  "chapterCount",
] satisfies Array<keyof MediaDocument>

export const initMediasIndex = async ({
  db,
  meili,
  mediasIndex,
}: {
  db: Kysely<DB>
  meili: Meilisearch
  mediasIndex: string
}) => {
  await meili.createIndex(mediasIndex, { primaryKey: "id" }).catch(() => {})

  await meili
    .index(mediasIndex)
    .updateSettings({
      searchableAttributes,
      filterableAttributes,
      sortableAttributes,
      displayedAttributes,
    })
    .waitTask()

  const ids = await db.selectFrom("medias").select("id").where("deletedAt", "is", null).execute()

  // oxlint-disable-next-line no-console
  console.log(`Reindexing ${ids.length} medias in batches of ${INDEXES_BATCH_SIZE}...`)

  for (let i = 0; i < ids.length; i += INDEXES_BATCH_SIZE) {
    const batch = ids.slice(i, i + INDEXES_BATCH_SIZE)
    const rawDocuments = await Promise.all(batch.map((row) => getMediaDocument(db, row.id)))
    const filtered = rawDocuments.filter((doc) => !isNullish(doc))

    await meili.index(mediasIndex).addDocuments(filtered)

    // oxlint-disable-next-line no-console
    console.log(`  pushed ${i + batch.length} / ${ids.length}`)
  }
}
