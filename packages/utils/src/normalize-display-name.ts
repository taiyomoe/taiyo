import { faker } from "@faker-js/faker"

export const DISPLAYNAME_REGEX = /^[a-zA-Z0-9_.]$/g
export const DISPLAYNAME_MIN_LENGTH = 3
export const DISPLAYNAME_MAX_LENGTH = 30

export const normalizeDisplayName = (input: string) => {
  const normalized = input
    .slice(0, DISPLAYNAME_MAX_LENGTH)
    .replace(DISPLAYNAME_REGEX, "")

  return normalized.length < DISPLAYNAME_MIN_LENGTH
    ? faker.internet.username()
    : normalized
}
