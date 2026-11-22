import { getDb } from "@taiyomoe/db"
import { getMeiliClient, indexInitializers } from "@taiyomoe/search"
import { defineCommand } from "citty"

const indexNames = indexInitializers.map((i) => i.name)

export default defineCommand({
  meta: {
    name: "init-meilisearch",
    description: "Initialize Meilisearch indexes.",
  },
  args: {
    index: {
      type: "string",
      description: `Only initialize the given index. Defaults to all indexes.`,
      valueHint: indexNames.join("|"),
      required: false,
    },
  },
  run: async ({ args }) => {
    const { index } = args
    const hasIndex = index !== undefined && index !== ""
    const targets = hasIndex ? indexInitializers.filter((i) => i.name === index) : indexInitializers

    if (hasIndex && targets.length === 0) {
      console.error(`Unknown index "${index}". Available: ${indexNames.join(", ")}.`)
      process.exit(1)
    }

    const db = getDb()
    const meili = getMeiliClient()

    for (const { name, init } of targets) {
      console.log(`Initializing ${name} index...`)

      await init({ db, meili })
    }

    console.log("Done.")
    process.exit(0)
  },
})
