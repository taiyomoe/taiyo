import type { Group, Selectable } from "@taiyomoe/db"
import { checkEntity } from "./check-entity"

export const checkGroup = (opts: { includeDeleted?: boolean } = {}) =>
  checkEntity({
    key: "group",
    description: "The ID of the group.",
    notFound: "GROUP_NOT_FOUND",
    load: (db, id): Promise<Selectable<Group> | undefined> => {
      const base = db.selectFrom("groups").selectAll().where("id", "=", id)

      return (
        opts.includeDeleted === true ? base : base.where("deletedAt", "is", null)
      ).executeTakeFirst()
    },
  })
