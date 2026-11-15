import { globSync, readFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { z } from "zod"
import { repoRoot } from "./env-file.ts"

// Paraglide compiles every message to its own function and the bundler drops the ones nothing
// calls, so a message the code stopped using never fails a build. This lists them instead.
const messageCall = /\bm(?:\.([A-Za-z_]\w*)|\[\s*["']([A-Za-z_]\w*)["']\s*\])/g
const ignoredDirs = new Set(["node_modules", "dist", "public", "paraglide"])
const settingsSchema = z.object({
  locales: z.array(z.string()),
  "plugin.inlang.messageFormat": z.object({ pathPattern: z.string() }),
})
const messagesSchema = z.record(z.string(), z.unknown())
const findUnusedMessages = (projectFile: string) => {
  const appDir = dirname(dirname(projectFile))
  const settings = settingsSchema.parse(JSON.parse(readFileSync(projectFile, "utf8")))
  const used = new Set(
    globSync("**/*.{ts,tsx}", {
      cwd: appDir,
      exclude: (name) => ignoredDirs.has(name),
    }).flatMap((file) =>
      Array.from(readFileSync(join(appDir, file), "utf8").matchAll(messageCall), (match) =>
        String(match[1] ?? match[2]),
      ),
    ),
  )

  return settings.locales.flatMap((locale) => {
    const path = join(
      appDir,
      settings["plugin.inlang.messageFormat"].pathPattern.replace("{locale}", locale),
    )
    const keys = Object.keys(messagesSchema.parse(JSON.parse(readFileSync(path, "utf8"))))
    const unused = keys.filter((key) => !key.startsWith("$") && !used.has(key))

    return unused.length > 0 ? [{ path: relative(repoRoot, path), unused }] : []
  })
}
const reports = globSync("apps/*/project.inlang/settings.json", { cwd: repoRoot }).flatMap((file) =>
  findUnusedMessages(join(repoRoot, file)),
)

for (const { path, unused } of reports) {
  console.error(`${path}: ${unused.length} unused message(s)\n  ${unused.join("\n  ")}`)
}

if (reports.length > 0) {
  process.exit(1)
}

console.log("Every message is used.")
