import type { Banner, Selectable } from "@taiyomoe/db"
import { checkEntity } from "./check-entity"

export const checkBanner = (opts: { includeDeleted?: boolean } = {}) =>
  checkEntity({
    key: "banner",
    description: "The ID of the banner.",
    notFound: "BANNER_NOT_FOUND",
    load: (db, id): Promise<Selectable<Banner> | undefined> => {
      const base = db.selectFrom("banners").selectAll().where("id", "=", id)

      return (
        opts.includeDeleted === true ? base : base.where("deletedAt", "is", null)
      ).executeTakeFirst()
    },
  })
