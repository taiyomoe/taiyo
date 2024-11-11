"use server"

import { db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { UsersIndexService } from "@taiyomoe/meilisearch/services"
import type { NextAuthConfig } from "next-auth"
import { getIp } from "../utils"

export const createUserHandler: NonNullable<
  NextAuthConfig["events"]
>["createUser"] = async ({ user }) => {
  if (!user.id) return

  await db.userProfile.create({ data: { userId: user.id } })
  await db.userSetting.create({ data: { userId: user.id } })
  await db.userLibrary.create({ data: { userId: user.id } })
  await logsClient.users.auth.insert({
    type: "registered",
    ip: getIp(),
    userId: user.id,
  })
  await UsersIndexService.sync(db, [user.id])
}
