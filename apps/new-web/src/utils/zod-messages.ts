import type { InferNestedValues } from "@taiyomoe/types"

export const zodMessages = {
  username: {
    min3Characters: "validation.username.min3Characters",
    max30Characters: "validation.username.max30Characters",
    invalidCharacters: "validation.username.invalidCharacters",
  },
  email: {
    required: "validation.email.required",
    invalid: "validation.email.invalid",
    max100Characters: "validation.email.max100Characters",
  },
  password: {
    required: "validation.password.required",
    min8Character: "validation.password.min8Character",
    max50Characters: "validation.password.max50Characters",
    atLeast1Number: "validation.password.atLeast1Number",
    atLeast1Uppercase: "validation.password.atLeast1Uppercase",
    atLeast1SpecialCharacter: "validation.password.atLeast1SpecialCharacter",
    mismatch: "validation.password.mismatch",
  },
} as const

export type ZodMessages = InferNestedValues<typeof zodMessages>
