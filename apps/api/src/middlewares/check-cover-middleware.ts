import type { Cover, Selectable } from "@taiyomoe/db"
import { checkEntity } from "./check-entity"

export const checkCover = (opts: { includeDeleted?: boolean } = {}) =>
  checkEntity({
    key: "cover",
    description: "The ID of the cover.",
    notFound: "COVER_NOT_FOUND",
    load: (db, id): Promise<Selectable<Cover> | undefined> => {
      const base = db.selectFrom("covers").selectAll().where("id", "=", id)

      return (
        opts.includeDeleted === true ? base : base.where("deletedAt", "is", null)
      ).executeTakeFirst()
    },
  })
