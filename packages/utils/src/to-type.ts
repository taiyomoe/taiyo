import type { MediaType } from "../../db/src/index"

export const toType = (input: string): MediaType => {
  switch (input.toLowerCase()) {
    case "ko":

    case "en":
      return "MANHWA"

    case "zh":

    case "zh_hk":
      return "MANHUA"

    default:
      return "MANGA"
  }
}
