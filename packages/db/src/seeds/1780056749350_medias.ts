import type { Kysely } from "kysely"
import type { DB } from "../database"
import * as media1 from "./medias/media-1"
import * as media10 from "./medias/media-10"
import * as media11 from "./medias/media-11"
import * as media12 from "./medias/media-12"
import * as media13 from "./medias/media-13"
import * as media14 from "./medias/media-14"
import * as media15 from "./medias/media-15"
import * as media16 from "./medias/media-16"
import * as media17 from "./medias/media-17"
import * as media18 from "./medias/media-18"
import * as media19 from "./medias/media-19"
import * as media2 from "./medias/media-2"
import * as media3 from "./medias/media-3"
import * as media4 from "./medias/media-4"
import * as media5 from "./medias/media-5"
import * as media6 from "./medias/media-6"
import * as media7 from "./medias/media-7"
import * as media8 from "./medias/media-8"
import * as media9 from "./medias/media-9"

export async function seed(db: Kysely<DB>): Promise<void> {
  await media1.execute(db)
  await media2.execute(db)
  await media3.execute(db)
  await media4.execute(db)
  await media5.execute(db)
  await media6.execute(db)
  await media7.execute(db)
  await media8.execute(db)
  await media9.execute(db)
  await media10.execute(db)
  await media11.execute(db)
  await media12.execute(db)
  await media13.execute(db)
  await media14.execute(db)
  await media15.execute(db)
  await media16.execute(db)
  await media17.execute(db)
  await media18.execute(db)
  await media19.execute(db)
}
