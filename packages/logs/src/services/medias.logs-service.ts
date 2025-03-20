import type { Media } from "@taiyomoe/db"
import { diff } from "deep-object-diff"
import SuperJSON from "superjson"
import type { InsertResource } from "../types"
import { insertWrapper } from "../utils"

export const MediasService = {
  insert: (input: InsertResource<Media>) =>
    insertWrapper(
      "logs.medias",
      ["type", "old", "new", "diff", "mediaId", "userId"],
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
