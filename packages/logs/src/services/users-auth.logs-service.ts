import { insertWrapper } from "../utils"

type LogsUsersAuthType = "registered" | "signedIn" | "signedOut"
type LogsUsersAuthInsertInput = {
  type: LogsUsersAuthType
  ip?: string | null
  userId: string
}

export const UsersAuthService = {
  insert: (input: LogsUsersAuthInsertInput) =>
    insertWrapper(
      "logs.usersAuth",
      ["type", "ip", "userId"],
      [input.type, input.ip ?? null, input.userId],
    ),
}
