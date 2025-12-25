import type { MediaDemography } from "../../db/src/index"

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
    default:
      if (input) {
        console.warn(
          `Invalid demography key "${input}", defaulting to SHOUNEN...`,
        )
      }

      return "SHOUNEN"
  }
}
