"use server"

import { logsClient } from "@taiyomoe/logs"
import type { NextAuthConfig } from "next-auth"
import { getIp } from "../utils"

export const signOutHandler: NonNullable<NextAuthConfig["events"]>["signOut"] =
  async (message) => {
    if ("token" in message) {
      throw new Error("Unreachable with JWT strategy.")
    }

    if (!message.session?.userId) return

    await logsClient.users.auth.insert({
      type: "signedOut",
      ip: getIp(),
      userId: message.session.userId,
    })
  }
