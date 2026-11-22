import type { Kysely } from "kysely"
import { chunk } from "remeda"
import type { DB } from "../database"
import { readSampleRows, SAMPLE_TABLES } from "../sample"

export async function seed(db: Kysely<DB>): Promise<void> {
  for (const table of SAMPLE_TABLES) {
    if (table === "featuredMedias") {
      continue
    }

    for (const rows of chunk(await readSampleRows(table), 1000)) {
      await db.insertInto(table).values(rows).execute()
    }
  }
}
