import { logsClient } from "@taiyomoe/logs"
import type { Session } from "better-auth"

export const afterSessionCreatedHook = async ({
  userId,
  ipAddress,
}: Session) => {
  await logsClient.users.auth.insert({
    type: "signedIn",
    ip: ipAddress ?? null,
    userId,
  })
}
