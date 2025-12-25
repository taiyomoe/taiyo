import { toLanguage } from "./to-language"

export const toLocalizedText = (
  input: Record<string, unknown>,
): PrismaJson.LocalizedText => {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(input)) {
    const language = toLanguage(key)

    if (language && typeof value === "string") {
      result[language] = value
    } else {
      console.warn(`Invalid language key "${key}", skipping...`)
    }
  }

  return result
}
