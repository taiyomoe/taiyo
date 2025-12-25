import type { MediaStatus } from "../../db/src/index"

export const toStatus = (input: string): MediaStatus => {
  switch (input.toLowerCase()) {
    case "ongoing":
      return "RELEASING"
    case "hiatus":
      return "HIATUS"
    case "completed":
      return "FINISHED"
    case "cancelled":
      return "CANCELLED"
    default:
      console.warn(`Invalid status key "${input}", defaulting to CANCELLED...`)

      return "CANCELLED"
  }
}
