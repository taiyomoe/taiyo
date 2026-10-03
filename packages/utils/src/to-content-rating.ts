import type { ContentRating } from "../../db/src/index"

export const toContentRating = (input: string): ContentRating => {
  switch (input.toLowerCase()) {
    case "safe":
      return "NORMAL"

    case "suggestive":
      return "SUGGESTIVE"

    default:
      // oxlint-disable-next-line no-console
      console.warn(`Invalid content rating key "${input}", defaulting to NSFW...`)

      return "NSFW"
  }
}
