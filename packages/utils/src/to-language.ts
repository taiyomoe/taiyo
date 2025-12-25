import { Languages } from "../../db/src/index"

export const toLanguage = (input?: string | null) => {
  switch (input) {
    case "ja-ro":
      return "ja_ro"
    case "ko-ro":
      return "ko_ro"
    case "zh-ro":
      return "zh_ro"
    case "zh-hk":
      return "zh_hk"
    case "pt":
      return "pt_pt"
    case "pt-br":
      return "pt_br"
    case "es-la":
      return "es_la"
    default: {
      if (input && input in Languages) {
        return input as Languages
      }

      console.warn(`Invalid language key "${input}", skipping...`)

      return null
    }
  }
}
