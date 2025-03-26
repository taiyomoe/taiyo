import { db } from "@taiyomoe/db"
import { getUserIndexItem, meilisearchClient } from "@taiyomoe/meilisearch"
import type { User } from "better-auth"

export const afterUserCreatedHook = async ({ id }: User) => {
  const userIndexItem = await getUserIndexItem(db, id)

  await db.userProfile.create({ data: { userId: id } })
  await db.userLibrary.create({ data: { userId: id } })
  await meilisearchClient.users.addDocuments([userIndexItem])
  // await logsClient.users.auth.insert({
  //   type: "registered",
  //   userId: id,
  // })
}
