import type { Kysely } from "kysely"
import type { DB } from "../database"
import * as media1 from "./medias/media-1"
import * as media2 from "./medias/media-2"
import * as media3 from "./medias/media-3"
import * as media19 from "./medias/media-19"

export async function seed(db: Kysely<DB>): Promise<void> {
  await media1.execute(db)
  await media2.execute(db)
  await media3.execute(db)
  await media19.execute(db)
}
