import type { MediaTitle } from "@taiyomoe/db"
import { ObjectUtils } from "@taiyomoe/utils"
import SuperJSON from "superjson"
import type { InsertResource } from "../types"
import { insertWrapper } from "../utils"

export const TitlesService = {
  insert: (input: InsertResource<MediaTitle>) =>
    insertWrapper(
      "logs.titles",
      ["type", "old", "new", "diff", "titleId", "userId"],
      [
        input.type,
        SuperJSON.serialize("old" in input ? input.old : {}),
        SuperJSON.serialize("_new" in input ? input._new : {}),
        input.type === "updated"
          ? Object.keys(ObjectUtils.deepDiff(input.old, input._new))
          : [],
        "old" in input ? input.old.id : input._new.id,
        input.userId,
      ],
    ),
}
