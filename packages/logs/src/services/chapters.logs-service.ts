import type { MediaChapter } from "@taiyomoe/db"
import { diff } from "deep-object-diff"
import SuperJSON from "superjson"
import type { InsertResource } from "../types"
import { insertWrapper } from "../utils"

export const ChaptersService = {
  insert: (input: InsertResource<MediaChapter>) =>
    insertWrapper(
      "logs.chapters",
      ["type", "old", "new", "diff", "chapterId", "userId"],
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
