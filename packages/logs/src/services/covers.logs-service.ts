import type { MediaCover } from "@taiyomoe/db"
import { diff } from "deep-object-diff"
import SuperJSON from "superjson"
import type { InsertResource } from "../types"
import { insertWrapper } from "../utils"

export const CoversService = {
  insert: (input: InsertResource<MediaCover>) =>
    insertWrapper(
      "logs.covers",
      ["type", "old", "new", "diff", "coverId", "userId"],
      [
        input.type,
        SuperJSON.serialize("old" in input ? input.old : {}),
        SuperJSON.serialize("_new" in input ? input._new : {}),
        input.type === "updated"
          ? Object.keys(diff(input.old, input._new))
          : [],
        "old" in input ? input.old.id : input._new.id,
        input.userId,
      ],
    ),
}
