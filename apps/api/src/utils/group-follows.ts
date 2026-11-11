import type { DB, Kysely } from "@taiyomoe/db"
import z from "zod"

export const groupFollowSchema = z.object({
  following: z.boolean().meta({ description: "Whether you follow the group." }),
  followerCount: z.int().meta({ description: "How many users follow the group." }),
})

export const getGroupFollow = async (db: Kysely<DB>, groupId: string, userId: string) => {
  const row = await db
    .selectFrom("groupFollows")
    .where("groupId", "=", groupId)
    .select((eb) => [
      eb.fn.countAll<string>().as("count"),
      eb.fn.countAll<string>().filterWhere("userId", "=", userId).as("mine"),
    ])
    .executeTakeFirstOrThrow()

  return { following: Number(row.mine) > 0, followerCount: Number(row.count) }
}
