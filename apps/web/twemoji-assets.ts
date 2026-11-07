import type { Plugin } from "vite"
import { createReadStream, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SVG_DIR = path.dirname(fileURLToPath(import.meta.resolve("@twemoji/svg/package.json")))
const FILE_NAME = /^[0-9a-f]+(?:-[0-9a-f]+)*\.svg$/

export const twemojiAssets = (): Plugin => ({
  name: "taiyo:twemoji-assets",
  configureServer(server) {
    server.middlewares.use("/twemoji", (req, res, next) => {
      const fileName = (req.url ?? "").split("?")[0]?.replace(/^\//, "") ?? ""

      if (!FILE_NAME.test(fileName)) {
        next()

        return
      }

      res.setHeader("Content-Type", "image/svg+xml")
      res.setHeader("Cache-Control", "public, max-age=86400")
      createReadStream(path.join(SVG_DIR, fileName))
        .on("error", () => {
          res.statusCode = 404
          res.end()
        })
        .pipe(res)
    })
  },
  generateBundle() {
    if (this.environment.name !== "client") {
      return
    }

    for (const fileName of readdirSync(SVG_DIR)) {
      if (FILE_NAME.test(fileName)) {
        this.emitFile({
          type: "asset",
          fileName: `twemoji/${fileName}`,
          source: readFileSync(path.join(SVG_DIR, fileName)),
        })
      }
    }
  },
})
