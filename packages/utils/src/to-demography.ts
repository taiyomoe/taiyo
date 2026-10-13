import type { MediaDemography } from "@taiyomoe/db"

export const toDemography = (input: string | null): MediaDemography => {
  switch (input?.toLowerCase()) {
    case "shounen":
      return "SHOUNEN"

    case "shoujo":
      return "SHOUJO"

    case "josei":
      return "JOSEI"

    case "seinen":
      return "SEINEN"

    case undefined:
      return "SHOUNEN"

    default:
      if (input !== null && input !== "") {
        // oxlint-disable-next-line no-console
        console.warn(`Invalid demography key "${input}", defaulting to SHOUNEN...`)
      }

      return "SHOUNEN"
  }
}
