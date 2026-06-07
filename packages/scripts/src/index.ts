import { defineCommand, runMain } from "citty"

const main = defineCommand({
  meta: {
    name: "scripts",
    description: "Taiyō internal scripts CLI.",
  },
  subCommands: {
    "init-meilisearch": () => import("./init-meilisearch").then((m) => m.default),
  },
})

void runMain(main)
