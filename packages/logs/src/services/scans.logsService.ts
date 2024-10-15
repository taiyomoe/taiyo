import type { Scan } from "@taiyomoe/db"
import { ObjectUtils } from "@taiyomoe/utils"
import SuperJSON from "superjson"
import type { InsertResource } from "../types"
import { insertWrapper } from "../utils"

type LogsScansInsertInput = InsertResource<Scan> & {
  affectedChaptersIds?: string[]
}

export const scansService = {
  insert: (input: LogsScansInsertInput) =>
    insertWrapper(
      "logs.scans",
      ["type", "old", "new", "diff", "affectedChaptersId", "scanId", "userId"],
      [
        input.type,
        SuperJSON.serialize("old" in input ? input.old : {}),
        SuperJSON.serialize("_new" in input ? input._new : {}),
        input.type === "updated"
          ? Object.keys(ObjectUtils.deepDiff(input.old, input._new))
          : [],
        input.affectedChaptersIds ?? [],
        "old" in input ? input.old.id : input._new.id,
        input.userId,
      ],
    ),
}
