import type { GroupCreationRequest, Selectable } from "@taiyomoe/db"
import { checkEntity } from "./check-entity"

export const checkGroupCreationRequest = () =>
  checkEntity({
    key: "groupCreationRequest",
    description: "The ID of the group creation request.",
    notFound: "GROUP_CREATION_REQUEST_NOT_FOUND",
    logRow: false,
    load: (db, id): Promise<Selectable<GroupCreationRequest> | undefined> =>
      db.selectFrom("groupCreationRequests").selectAll().where("id", "=", id).executeTakeFirst(),
  })
