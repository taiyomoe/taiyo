"use server"

import { logsClient } from "@taiyomoe/logs"

export const signedOutHandler = async (userId: string, ip?: string | null) => {
  await logsClient.users.auth.insert({
    type: "signedOut",
    ip,
    userId,
  })
}
