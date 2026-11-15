import { faker } from "@faker-js/faker"
import { config } from "@taiyomoe/config"

export const normalizeDisplayName = (input: string) => {
  const normalized = input
    .replace(/[^a-zA-Z0-9_.\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, config.auth.displayName.maxLength)
    .trim()

  return normalized.length < config.auth.displayName.minLength
    ? faker.internet.username()
    : normalized
}
