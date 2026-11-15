import { faker } from "@faker-js/faker"
import { config } from "@taiyomoe/config"

export const normalizeUsername = (input: string) => {
  const normalized = input
    .slice(0, config.auth.username.maxLength)
    .replaceAll(" ", "_")
    .replace(/[^a-zA-Z0-9_.]/g, "")
    .toLowerCase()

  return normalized.length < config.auth.username.minLength ? faker.internet.username() : normalized
}
