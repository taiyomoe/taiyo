import type { InferNestedValues } from "@taiyomoe/types"

export const authMessages = {
  USER_ALREADY_EXISTS: "auth.errors.emailAlreadyExists",
  USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER:
    "auth.errors.usernameAlreadyExists",
  INVALID_EMAIL_OR_PASSWORD: "auth.errors.invalidEmailOrPassword",
  EMAIL_NOT_VERIFIED: "auth.errors.emailNotVerified",
} as const

export type AuthMessages = InferNestedValues<typeof authMessages>
