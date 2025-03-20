import type { Session } from "better-auth"

export const afterSessionCreatedHook = async ({
  userId,
  ipAddress,
}: Session) => {
  console.debug("afterSessionCreatedHook", userId, ipAddress)
  // await logsClient.users.auth.insert({
  //   type: "signedIn",
  //   ip: ipAddress ?? null,
  //   userId,
  // })
}
