import type { InferNestedValues } from "@taiyomoe/types"

export const authMessages = {
  USER_ALREADY_EXISTS: "auth.errors.emailAlreadyExists",
  USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER:
    "auth.errors.usernameAlreadyExists",
} as const

export type AuthMessages = InferNestedValues<typeof authMessages>
