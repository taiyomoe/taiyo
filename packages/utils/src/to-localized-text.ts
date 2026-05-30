import type { LocalizedText } from "@taiyomoe/db"
import { toLanguage } from "./to-language"

export const toLocalizedText = (
  input: Record<string, unknown>,
): LocalizedText => {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(input)) {
    const language = toLanguage(key)

    if (language && typeof value === "string") {
      result[language] = value.replaceAll("，", ", ")
    } else {
      console.warn(`Invalid language key "${key}", skipping...`)
    }
  }

  return result
}
