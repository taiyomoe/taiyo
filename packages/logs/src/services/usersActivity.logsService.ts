import { insertWrapper } from "../utils"

type LogsUsersActivityType = "follow" | "unfollow" | "completedChapter"
type LogsUsersActivityInsertInput = {
  type: LogsUsersActivityType
  userId: string
  targetId: string
}

export const usersActivityService = {
  insert: (input: LogsUsersActivityInsertInput) =>
    insertWrapper(
      "logs.usersActivity",
      ["type", "userId", "targetId"],
      [input.type, input.userId, input.targetId],
    ),
}
