import { faker } from "@faker-js/faker"

export const USERNAME_REGEX = /^[a-zA-Z0-9_.]$/g
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30

export const normalizeUsername = (input: string) => {
  const normalized = input
    .slice(0, USERNAME_MAX_LENGTH)
    .replace(USERNAME_REGEX, "")
    .toLowerCase()

  return normalized.length < USERNAME_MIN_LENGTH
    ? faker.internet.username()
    : normalized
}
