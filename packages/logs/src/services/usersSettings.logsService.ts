import { insertWrapper } from "../utils"

type LogsUsersSettingsInsertInput = {
  type: string
  old: string
  new: string
  userId: string
}

const logsUsersSettingsType = [
  "profile.birthDate",
  "profile.gender",
  "profile.city",
  "profile.country",
  "profile.about",
  "contentRating",
  "preferredTitles",
  "showFollowing",
  "showLibrary",
]

export const usersSettingsService = {
  insert: (input: LogsUsersSettingsInsertInput) => {
    if (!logsUsersSettingsType.includes(input.type)) {
      console.error(
        "Users settings logs service didn't receive a valid type",
        input.type,
      )

      return
    }

    return insertWrapper(
      "logs.usersSettings",
      ["type", "old", "new", "userId"],
      [input.type, input.old, input.new, input.userId],
    )
  },
}
