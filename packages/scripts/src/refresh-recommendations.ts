import { getDb } from "@taiyomoe/db"
import { refreshMediaSimilarities } from "@taiyomoe/recommendations"
import { defineCommand } from "citty"

export default defineCommand({
  meta: {
    name: "refresh-recommendations",
    description: "Recompute the similar titles of every media.",
  },
  run: async () => {
    const result = await refreshMediaSimilarities({ db: getDb() })

    console.log(
      `Computed ${result.medias} medias from ${result.interactions} reader signals in ${result.durationMs} ms, ${result.written} changed.`,
    )
    process.exit(0)
  },
})
