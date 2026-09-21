import { faker } from "@faker-js/faker"
import { config } from "@taiyomoe/config"

export const normalizeDisplayName = (input: string) => {
  const normalized = input
    .slice(0, config.auth.displayName.maxLength)
    .replace(/[^a-zA-Z0-9_.\s]/g, "")

  return normalized.length < config.auth.displayName.minLength
    ? faker.internet.username()
    : normalized
}
