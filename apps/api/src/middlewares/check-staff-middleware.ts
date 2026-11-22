import type { Staff, Selectable } from "@taiyomoe/db"
import { checkEntity } from "./check-entity"

export const checkStaff = (opts: { includeDeleted?: boolean } = {}) =>
  checkEntity({
    key: "staff",
    description: "The ID of the staff.",
    notFound: "STAFF_NOT_FOUND",
    load: (db, id): Promise<Selectable<Staff> | undefined> => {
      const base = db.selectFrom("staffs").selectAll().where("id", "=", id)

      return (
        opts.includeDeleted === true ? base : base.where("deletedAt", "is", null)
      ).executeTakeFirst()
    },
  })
