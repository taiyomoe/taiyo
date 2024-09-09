import { insertWrapper } from "../utils"

type LogsUsersAuthType = "registered" | "signedIn" | "signedOut"
type LogsUsersAuthInsertInput = {
  type: LogsUsersAuthType
  ip: string
  userId: string
}

export const usersAuthService = {
  insert: (input: LogsUsersAuthInsertInput) =>
    insertWrapper(
      "logs.usersAuth",
      ["type", "ip", "userId"],
      [input.type, input.ip, input.userId],
    ),
}
