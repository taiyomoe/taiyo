import { LANGUAGES } from "@taiyomoe/db"

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

    case null:

    case undefined:
      break

    default: {
      const language = LANGUAGES.find((candidate) => candidate === input)

      if (language !== undefined) {
        return language
      }
    }
  }

  // oxlint-disable-next-line no-console
  console.warn(`Invalid language key "${input}", skipping...`)

  return null
}
