import { config } from "@taiyomoe/config"

const fallbackName = () => `reader_${crypto.randomUUID().slice(0, 8)}`

export const normalizeUsername = (input: string) => {
  const normalized = input
    .slice(0, config.auth.username.maxLength)
    .replaceAll(" ", "_")
    .replace(/[^a-zA-Z0-9_.]/g, "")
    .toLowerCase()

  return normalized.length < config.auth.username.minLength ? fallbackName() : normalized
}
