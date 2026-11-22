import { config } from "@taiyomoe/config"

const fallbackName = () => `reader_${crypto.randomUUID().slice(0, 8)}`

export const normalizeDisplayName = (input: string) => {
  const normalized = input
    .replace(/[^a-zA-Z0-9_.\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, config.auth.displayName.maxLength)
    .trim()

  return normalized.length < config.auth.displayName.minLength ? fallbackName() : normalized
}
