import type { InferNestedValues } from "@taiyomoe/types"

export const authMessages = {
  USER_NOT_FOUND: "auth.errors.userNotFound",
  USER_ALREADY_EXISTS: "auth.errors.emailAlreadyExists",
  USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER:
    "auth.errors.usernameAlreadyExists",
  INVALID_EMAIL: "auth.errors.invalidEmail",
  USERNAME_IS_INVALID: "auth.errors.invalidUsername",
  INVALID_EMAIL_OR_PASSWORD: "auth.errors.invalidEmailOrPassword",
  INVALID_USERNAME_OR_PASSWORD: "auth.errors.invalidUsernameOrPassword",
  EMAIL_NOT_VERIFIED: "auth.errors.emailNotVerified",
  VERIFICATION_EMAIL_ALREADY_SENT: "auth.errors.verificationEmailAlreadySent",
  INVALID_TOKEN: "auth.errors.invalidToken",
} as const

export type AuthMessages = InferNestedValues<typeof authMessages>
