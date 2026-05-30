import type { MediaCountryOfOrigin } from "../../db/src/index"

export const toCountryOfOrigin = (input: string): MediaCountryOfOrigin => {
  switch (input.toLowerCase()) {
    case "ko":
      return "KOREA"

    case "zh":

    case "zh_hk":
      return "CHINA"

    case "en":
      return "USA"

    case "fr":
      return "FRANCE"

    case "pt_br":
      return "BRAZIL"

    default:
      return "JAPAN"
  }
}
