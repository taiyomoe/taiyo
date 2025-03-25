import { faker } from "@faker-js/faker"

export const DISPLAYNAME_REGEX = /^[a-zA-Z0-9_.\s]{3,30}$/
export const DISPLAYNAME_MIN_LENGTH = 3
export const DISPLAYNAME_MAX_LENGTH = 30

export const normalizeDisplayName = (input: string) => {
  const normalized = input
    .slice(0, DISPLAYNAME_MAX_LENGTH)
    .replace(/[^a-zA-Z0-9_.\s]/g, "")

  return normalized.length < DISPLAYNAME_MIN_LENGTH
    ? faker.internet.username()
    : normalized
}
