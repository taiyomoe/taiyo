"use server"

import { logsClient } from "@taiyomoe/logs"
import type { NextAuthConfig } from "next-auth"
import { getIp } from "../utils"

export const signInHandler: NonNullable<NextAuthConfig["events"]>["signIn"] =
  async ({ user }) => {
    if (!user.id) return

    await logsClient.users.auth.insert({
      type: "signedIn",
      ip: getIp(),
      userId: user.id,
    })
  }
