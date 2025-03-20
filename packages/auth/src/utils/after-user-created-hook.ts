import { db } from "@taiyomoe/db"
import { UsersIndexService } from "@taiyomoe/meilisearch/services"
import type { User } from "better-auth"

export const afterUserCreatedHook = async ({ id }: User) => {
  await db.userProfile.create({ data: { userId: id } })
  await db.userSetting.create({ data: { userId: id } })
  await db.userLibrary.create({ data: { userId: id } })
  // await logsClient.users.auth.insert({
  //   type: "registered",
  //   userId: id,
  // })

  await UsersIndexService.sync(db, [id])
}
