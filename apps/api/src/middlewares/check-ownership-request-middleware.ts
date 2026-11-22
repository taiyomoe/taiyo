import type { GroupOwnershipRequest, Selectable } from "@taiyomoe/db"
import { checkEntity } from "./check-entity"

export const checkOwnershipRequest = () =>
  checkEntity({
    key: "ownershipRequest",
    description: "The ID of the ownership request.",
    notFound: "OWNERSHIP_REQUEST_NOT_FOUND",
    load: (db, id): Promise<Selectable<GroupOwnershipRequest> | undefined> =>
      db.selectFrom("groupOwnershipRequests").selectAll().where("id", "=", id).executeTakeFirst(),
  })
