import { globSync, readFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { z } from "zod"
import { repoRoot } from "./env-file.ts"

// Paraglide compiles every message to its own function and the bundler drops the ones nothing
// calls, so a message the code stopped using never fails a build. A locale missing a key silently
// falls back to the base locale. This reports both, so every locale stays a 1:1 translation.
const messageCall = /\bm(?:\.([A-Za-z_]\w*)|\[\s*["']([A-Za-z_]\w*)["']\s*\])/g
const ignoredDirs = new Set(["node_modules", "dist", "public", "paraglide"])
const settingsSchema = z.object({
  baseLocale: z.string(),
  locales: z.array(z.string()),
  "plugin.inlang.messageFormat": z.object({ pathPattern: z.string() }),
})
const messagesSchema = z.record(z.string(), z.unknown())
const checkProject = (projectFile: string) => {
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
  const readKeys = (locale: string) => {
    const path = join(
      appDir,
      settings["plugin.inlang.messageFormat"].pathPattern.replace("{locale}", locale),
    )
    const keys = Object.keys(messagesSchema.parse(JSON.parse(readFileSync(path, "utf8"))))

    return { path: relative(repoRoot, path), keys: keys.filter((key) => !key.startsWith("$")) }
  }
  const base = readKeys(settings.baseLocale)
  const baseKeys = new Set(base.keys)

  return [
    { path: base.path, issue: "unused", keys: base.keys.filter((key) => !used.has(key)) },
    ...settings.locales
      .filter((locale) => locale !== settings.baseLocale)
      .flatMap((locale) => {
        const { path, keys } = readKeys(locale)
        const localeKeys = new Set(keys)

        return [
          { path, issue: "missing", keys: base.keys.filter((key) => !localeKeys.has(key)) },
          {
            path,
            issue: `not in ${base.path}`,
            keys: keys.filter((key) => !baseKeys.has(key)),
          },
        ]
      }),
  ].filter((report) => report.keys.length > 0)
}
const reports = globSync("apps/*/project.inlang/settings.json", { cwd: repoRoot }).flatMap((file) =>
  checkProject(join(repoRoot, file)),
)

for (const { path, issue, keys } of reports) {
  console.error(`${path}: ${keys.length} message(s) ${issue}\n  ${keys.join("\n  ")}`)
}

if (reports.length > 0) {
  process.exit(1)
}

console.log("Every message is used and translated in every locale.")
