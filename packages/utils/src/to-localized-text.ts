import { Languages } from "../../db/src/index"

export const toLocalizedText = (input: Record<string, unknown>) => {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(input)) {
    if (key in Languages && typeof value === "string") {
      result[key as Languages] = value
    }
  }

  return result as PrismaJson.LocalizedText
}
