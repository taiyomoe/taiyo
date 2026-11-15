import { defineCommand, runMain } from "citty"

const main = defineCommand({
  meta: {
    name: "scripts",
    description: "Taiyō internal scripts CLI.",
  },
  subCommands: {
    "init-meilisearch": () => import("./init-meilisearch").then((m) => m.default),
    "init-s3": () => import("./init-s3").then((m) => m.default),
    "delete-media": () => import("./delete-media").then((m) => m.default),
    "dev-sessions": () => import("./dev-sessions").then((m) => m.default),
    "extract-sample": () => import("./extract-sample").then((m) => m.default),
    "download-sample-images": () => import("./download-sample-images").then((m) => m.default),
    "upload-sample-images": () => import("./upload-sample-images").then((m) => m.default),
  },
})

void runMain(main)
