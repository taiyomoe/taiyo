import type { Selectable } from "kysely"
import { readFile } from "node:fs/promises"
import { gunzipSync } from "node:zlib"
import type { DB } from "./database"

export const SAMPLE_DIR = new URL("./seeds/sample/", import.meta.url)

export const SAMPLE_TABLES = [
  "users",
  "userProfiles",
  "userFollows",
  "staffs",
  "groups",
  "medias",
  "titles",
  "covers",
  "banners",
  "mediaStaffs",
  "chapters",
  "chapterGroups",
  "userHistories",
  "userLibraryEntries",
  "featuredMedias",
] as const satisfies ReadonlyArray<keyof DB>

export type SampleTable = (typeof SAMPLE_TABLES)[number]

export const getSampleFile = (table: SampleTable) => new URL(`${table}.jsonl.gz`, SAMPLE_DIR)

export type SampleRow<T extends SampleTable> = Selectable<DB[T]>

export const readSampleRows = async <T extends SampleTable>(table: T) =>
  gunzipSync(await readFile(getSampleFile(table)))
    .toString("utf8")
    .split("\n")
    .filter((line) => line !== "")
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    .map((line) => JSON.parse(line) as SampleRow<T>)
