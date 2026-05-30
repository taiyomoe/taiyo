import { LANGUAGES, type Language } from "@taiyomoe/db"

const isLanguage = (s: string): s is Language => (LANGUAGES as readonly string[]).includes(s)

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
      if (input && isLanguage(input)) {
        return input
      }

      console.warn(`Invalid language key "${input}", skipping...`)

      return null
    }
  }
}
