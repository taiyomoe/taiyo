import { getDb } from "@taiyomoe/db"
import { syncMediaRelations } from "@taiyomoe/recommendations"
import { defineCommand } from "citty"

export default defineCommand({
  meta: {
    name: "sync-media-relations",
    description:
      "Import sequels, prequels, side stories and other relations from MangaDex for every media that was never synced.",
  },
  run: async () => {
    const totals = await syncMediaRelations({ db: getDb() })

    console.log(`Synced ${totals.medias} medias, added ${totals.relations} relations.`)
    process.exit(0)
  },
})
