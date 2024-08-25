import type { Scan } from "@taiyomoe/db"
import { ObjectUtils } from "@taiyomoe/utils"
import SuperJSON from "superjson"
import type { InsertResource } from "../types"
import { insertWrapper } from "../utils"

type LogsScansInsertInput = (InsertResource<Scan> & {
  affectedChaptersIds?: string[]
})[]

export const scansService = {
  insert: (input: LogsScansInsertInput) =>
    insertWrapper(
      "logs.scans",
      ["type", "old", "new", "diff", "affectedChaptersId", "scanId", "userId"],
      ...input.map((item) => [
        item.type,
        SuperJSON.serialize("old" in item ? item.old : {}),
        SuperJSON.serialize("_new" in item ? item._new : {}),
        item.type === "updated"
          ? Object.keys(ObjectUtils.deepDiff(item.old, item._new))
          : [],
        item.affectedChaptersIds ?? [],
        "old" in item ? item.old.id : item._new.id,
        item.userId,
      ]),
    ),
}
