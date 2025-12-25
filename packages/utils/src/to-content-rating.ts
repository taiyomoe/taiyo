import type { ContentRating } from "../../db/src/index"

export const toContentRating = (input: string): ContentRating => {
  switch (input.toLowerCase()) {
    case "safe":
      return "NORMAL"
    case "suggestive":
      return "SUGGESTIVE"
    default:
      return "NSFW"
  }
}
